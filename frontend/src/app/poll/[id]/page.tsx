"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/store/auth"
import { apiClient, Poll } from "@/lib/api"
import { BarChart3, Share2, Users, Calendar, CheckCircle, Loader2 } from "lucide-react"
import { PollResults } from "@/components/poll/poll-results"
import { PollShare } from "@/components/poll/poll-share"

export default function PollPage() {
  const params = useParams()
  const pollId = parseInt(params.id as string)
  const { isAuthenticated } = useAuth()
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVoting, setIsVoting] = useState(false)
  const [selectedOption, setSelectedOption] = useState<number | null>(null)
  const [hasVoted, setHasVoted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [pollUrl, setPollUrl] = useState("")

  useEffect(() => {
    if (pollId) {
      loadPoll()
    }
    // Set poll URL after component mounts (client-side only)
    if (typeof window !== 'undefined') {
      setPollUrl(`${window.location.origin}/poll/${pollId}`)
    }
  }, [pollId])

  const loadPoll = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getPoll(pollId)
      if (response.data) {
        setPoll(response.data)
        // Check if user has already voted (you might want to implement this logic)
        setHasVoted(false) // For now, assume user hasn't voted
      } else {
        setError(response.error || "Poll not found")
      }
    } catch (error) {
      setError("Failed to load poll")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVote = async () => {
    if (!selectedOption || !poll) return

    setIsVoting(true)
    try {
      const response = await apiClient.vote(poll.id, selectedOption)
      if (response.data) {
        setHasVoted(true)
        // Reload poll to get updated results
        loadPoll()
      } else {
        setError(response.error || "Failed to vote")
      }
    } catch (error) {
      setError("Network error occurred")
    } finally {
      setIsVoting(false)
    }
  }

  const handleShare = () => {
    setShareModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <Loader2 className="w-8 h-8 mx-auto animate-spin" />
          <p className="mt-4 text-muted-foreground">Loading poll...</p>
        </div>
      </div>
    )
  }

  if (error || !poll) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Poll Not Found</CardTitle>
            <CardDescription>
              {error || "This poll doesn't exist or has been removed."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (poll.is_expired) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container px-4 py-8 mx-auto">
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription>{poll.description}</CardDescription>
              )}
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Users className="w-4 h-4" />
                  <span>{poll.total_votes} votes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>Expired</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <PollResults poll={poll} />
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container px-4 py-8 mx-auto">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <CardTitle className="text-2xl">{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription className="mt-2">{poll.description}</CardDescription>
                )}
                <div className="flex items-center mt-4 space-x-4 text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Users className="w-4 h-4" />
                    <span>{poll.total_votes} votes</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-4 h-4" />
                    <span>Created {new Date(poll.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {hasVoted ? (
              <div className="py-8 text-center">
                <CheckCircle className="w-16 h-16 mx-auto mb-4 text-green-500" />
                <h3 className="mb-2 text-xl font-semibold">Thank you for voting!</h3>
                <p className="mb-6 text-muted-foreground">
                  Your vote has been recorded. Here are the current results:
                </p>
                <PollResults poll={poll} />
              </div>
            ) : (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Choose your answer:</h3>
                <div className="space-y-2">
                  {poll.options?.map((option) => (
                    <Button
                      key={option.id}
                      variant={selectedOption === option.id ? "default" : "outline"}
                      className="justify-start w-full h-auto p-4"
                      onClick={() => setSelectedOption(option.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedOption === option.id 
                            ? 'border-accent bg-accent' 
                            : 'border-muted-foreground'
                        }`}>
                          {selectedOption === option.id && (
                            <div className="w-2 h-2 bg-background rounded-full mx-auto mt-0.5"></div>
                          )}
                        </div>
                        <span className="text-left">{option.text}</span>
                      </div>
                    </Button>
                  ))}
                </div>
                
                <Button
                  onClick={handleVote}
                  disabled={!selectedOption || isVoting}
                  className="w-full"
                >
                  {isVoting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Vote"
                  )}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Share Modal */}
      {poll && pollUrl && (
        <PollShare
          poll={poll}
          pollUrl={pollUrl}
          isOpen={shareModalOpen}
          onClose={() => setShareModalOpen(false)}
        />
      )}
    </div>
  )
}
