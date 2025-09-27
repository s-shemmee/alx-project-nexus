"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, Poll } from "@/lib/api"
import { X, Plus, Trash2, Loader2 } from "@/components/icons"

interface PollCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onPollCreated: (poll: Poll) => void
}

export function PollCreateModal({ isOpen, onClose, onPollCreated }: PollCreateModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    is_public: true,
    expires_at: "",
  })
  const [options, setOptions] = useState(["", ""])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    
    // Validation
    if (!formData.title.trim()) {
      setError("Poll title is required")
      return
    }
    
    const validOptions = options.filter(opt => opt.trim())
    if (validOptions.length < 2) {
      setError("At least 2 options are required")
      return
    }

    setIsLoading(true)
    
    try {
      const response = await apiClient.createPoll({
        title: formData.title,
        description: formData.description || undefined,
        options: validOptions,
        is_public: formData.is_public,
        expires_at: formData.expires_at || undefined,
      })

      if (response.data) {
        onPollCreated(response.data)
        handleClose()
      } else {
        setError(response.error || "Failed to create poll")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: "",
      description: "",
      is_public: true,
      expires_at: "",
    })
    setOptions(["", ""])
    setError(null)
    onClose()
  }

  const addOption = () => {
    if (options.length < 10) {
      setOptions([...options, ""])
    }
  }

  const removeOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index))
    }
  }

  const updateOption = (index: number, value: string) => {
    const newOptions = [...options]
    newOptions[index] = value
    setOptions(newOptions)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <Card className="bg-background">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">Create New Poll</CardTitle>
                <CardDescription>
                  Create a poll to gather opinions and insights
                </CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={handleClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                  {error}
                </div>
              )}

              {/* Poll Title */}
              <div className="space-y-2">
                <label htmlFor="title" className="text-sm font-medium">
                  Poll Title *
                </label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="What's your favorite programming language?"
                  required
                />
              </div>

              {/* Poll Description */}
              <div className="space-y-2">
                <label htmlFor="description" className="text-sm font-medium">
                  Description (Optional)
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Add more context about your poll..."
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              {/* Poll Options */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Poll Options * (2-10 options)
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Input
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                        placeholder={`Option ${index + 1}`}
                        required
                        className="flex-1"
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeOption(index)}
                          className="h-10 w-10 text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {options.length < 10 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addOption}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Option
                  </Button>
                )}
              </div>

              {/* Poll Settings */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="rounded border-input"
                  />
                  <label htmlFor="is_public" className="text-sm font-medium">
                    Make this poll public (visible to everyone)
                  </label>
                </div>

                <div className="space-y-2">
                  <label htmlFor="expires_at" className="text-sm font-medium">
                    Expiration Date (Optional)
                  </label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData(prev => ({ ...prev, expires_at: e.target.value }))}
                  />
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Poll"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
