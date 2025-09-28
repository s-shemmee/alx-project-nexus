/**
 * Poll Edit Page
 * 
 * This page allows users to edit their existing polls.
 * Features:
 * - Load existing poll data for editing
 * - Form validation with Zod schema
 * - Add/remove poll options dynamically
 * - Update poll settings (title, description, expiry, privacy)
 * - Real-time validation feedback
 * - Save changes with API integration
 * - Navigation back to poll view after successful update
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useForm, useFieldArray } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/store/auth"
import { apiClient, Poll, PollUpdate } from "@/lib/api"
import { 
  ArrowLeft, 
  Save, 
  Plus, 
  Trash2, 
  Loader2, 
  Calendar, 
  Globe, 
  Lock, 
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { toast } from "sonner"
import { motion } from "framer-motion"

// Poll edit validation schema
const pollEditSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .min(5, "Title must be at least 5 characters")
    .max(200, "Title must not exceed 200 characters"),
  description: z.string()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  options: z.array(
    z.object({
      id: z.number().optional(),
      text: z.string()
        .min(1, "Option text is required")
        .max(100, "Option must not exceed 100 characters")
    })
  ).min(2, "At least 2 options are required")
    .max(10, "Maximum 10 options allowed"),
  expires_at: z.string().optional(),
  is_public: z.boolean()
})

type PollEditData = z.infer<typeof pollEditSchema>

export default function PollEditPage() {
  const params = useParams()
  const router = useRouter()
  const pollId = parseInt(params.id as string)
  const { isAuthenticated, user } = useAuth()
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isDirty },
    setValue,
    watch,
    reset
  } = useForm<PollEditData>({
    resolver: zodResolver(pollEditSchema),
    defaultValues: {
      title: "",
      description: "",
      options: [{ text: "" }, { text: "" }],
      expires_at: "",
      is_public: true
    }
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: "options"
  })

  // Load poll data
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (pollId) {
      loadPoll()
    }
  }, [pollId, isAuthenticated])

  const loadPoll = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await apiClient.getPoll(pollId)
      if (response.data) {
        const pollData = response.data
        setPoll(pollData)
        
        // Check if user owns this poll
        if (typeof pollData.creator === 'object' && pollData.creator?.id !== user?.id) {
          setError("You don't have permission to edit this poll")
          return
        }
        
        // Populate form with poll data
        const formData: PollEditData = {
          title: pollData.title,
          description: pollData.description || "",
          options: (pollData.options || []).map(option => ({
            id: option.id,
            text: option.text
          })),
          expires_at: pollData.expires_at ? 
            new Date(pollData.expires_at).toISOString().slice(0, 16) : "",
          is_public: pollData.is_public
        }
        
        reset(formData)
      } else {
        setError("Poll not found")
      }
    } catch (error) {
      console.error('Failed to load poll:', error)
      setError("Failed to load poll data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async (data: PollEditData) => {
    try {
      setIsSaving(true)
      
      // Format data for API - preserve votes for existing options
      const updateData: PollUpdate = {
        title: data.title,
        description: data.description || "",
        options: data.options.map(option => {
          // Find the original option to preserve votes
          const originalOption = poll?.options.find(orig => orig.id === option.id)
          return {
            id: option.id,
            text: option.text,
            votes: originalOption?.votes || 0  // Preserve votes from original
          }
        }),
        expires_at: data.expires_at || undefined, // Change null to undefined
        is_public: data.is_public
      }
      
      const response = await apiClient.updatePoll(pollId, updateData)
      
      if (response.data) {
        toast.success("Poll updated successfully! 🎉", {
          description: "Your changes have been saved."
        })
        
        // Navigate back to poll view
        router.push(`/poll/${pollId}`)
      } else {
        toast.error("Failed to update poll", {
          description: response.error || "Please try again"
        })
      }
    } catch (error) {
      console.error('Failed to update poll:', error)
      toast.error("Failed to update poll", {
        description: "Please check your connection and try again"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addOption = () => {
    if (fields.length < 10) {
      append({ text: "" })
    }
  }

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index)
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading poll data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center text-red-500">
              <AlertCircle className="h-5 w-5 mr-2" />
              Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">{error}</p>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => router.back()}>
                Go Back
              </Button>
              <Button onClick={() => loadPoll()}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Edit Poll</h1>
              <p className="text-muted-foreground">Update your poll details and options</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Badge variant={poll?.is_public ? "default" : "secondary"}>
              {poll?.is_public ? (
                <>
                  <Globe className="h-3 w-3 mr-1" />
                  Public
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Private
                </>
              )}
            </Badge>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit(handleSave)} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Left Column - Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Poll Information</CardTitle>
                <CardDescription>
                  Update the basic details of your poll
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Poll Title *
                  </label>
                  <Input
                    {...register("title")}
                    placeholder="Enter poll title"
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Description
                  </label>
                  <textarea
                    {...register("description")}
                    placeholder="Optional description"
                    rows={3}
                    className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                      errors.description ? "border-red-500" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="text-sm text-red-500 mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                {/* Expiry Date */}
                <div>
                  <label className="block text-sm font-medium mb-2">
                    <Calendar className="h-4 w-4 inline mr-1" />
                    Expiry Date (Optional)
                  </label>
                  <Input
                    {...register("expires_at")}
                    type="datetime-local"
                    min={new Date().toISOString().slice(0, 16)}
                  />
                </div>

                {/* Privacy Setting */}
                <div>
                  <label className="flex items-center space-x-2">
                    <input
                      {...register("is_public")}
                      type="checkbox"
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm font-medium">
                      <Globe className="h-4 w-4 inline mr-1" />
                      Make poll public
                    </span>
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Public polls can be discovered and voted on by anyone
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Right Column - Options */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Poll Options</CardTitle>
                    <CardDescription>
                      Update or add new options for your poll
                    </CardDescription>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOption}
                    disabled={fields.length >= 10}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {fields.map((field, index) => (
                    <motion.div
                      key={field.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center space-x-2"
                    >
                      <div className="flex-1">
                        <Input
                          {...register(`options.${index}.text`)}
                          placeholder={`Option ${index + 1}`}
                          className={errors.options?.[index]?.text ? "border-red-500" : ""}
                        />
                        {errors.options?.[index]?.text && (
                          <p className="text-sm text-red-500 mt-1">
                            {errors.options[index].text?.message}
                          </p>
                        )}
                      </div>
                      {fields.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>

                {errors.options && (
                  <p className="text-sm text-red-500 mt-2">
                    {errors.options.message}
                  </p>
                )}

                <p className="text-sm text-muted-foreground mt-4">
                  {fields.length}/10 options • Minimum 2 required
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Save Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                  {isDirty && (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-500" />
                      <span>You have unsaved changes</span>
                    </>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => router.back()}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isDirty || isSaving}
                    className="min-w-[120px]"
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
