"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/store/auth"
import { apiClient, Poll } from "@/lib/api"
import { BarChart3, Plus, Users, Calendar, Share2, Edit, Trash2 } from "@/components/icons"
import { PollCreateModal } from "@/components/poll/poll-create-modal"

export default function DashboardPage() {
  const { user, isAuthenticated } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [createModalOpen, setCreateModalOpen] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      loadUserPolls()
    }
  }, [isAuthenticated])

  const loadUserPolls = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getUserPolls()
      if (response.data) {
        setPolls(response.data)
      }
    } catch (error) {
      console.error('Failed to load polls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePollCreated = (newPoll: Poll) => {
    setPolls(prev => [newPoll, ...prev])
    setCreateModalOpen(false)
  }

  const handleDeletePoll = async (pollId: number) => {
    if (confirm('Are you sure you want to delete this poll?')) {
      try {
        await apiClient.deletePoll(pollId)
        setPolls(prev => prev.filter(poll => poll.id !== pollId))
      } catch (error) {
        console.error('Failed to delete poll:', error)
      }
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
            <CardDescription>
              Please log in to access your dashboard.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">My Polls</h1>
              <p className="text-muted-foreground">
                Create and manage your polls
              </p>
            </div>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading your polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No polls yet</h3>
            <p className="text-muted-foreground mb-6">
              Create your first poll to get started
            </p>
            <Button onClick={() => setCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Poll
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg line-clamp-2">
                        {poll.title}
                      </CardTitle>
                      {poll.description && (
                        <CardDescription className="mt-2 line-clamp-2">
                          {poll.description}
                        </CardDescription>
                      )}
                    </div>
                    <div className="flex items-center space-x-1 ml-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleDeletePoll(poll.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{poll.total_votes} votes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {new Date(poll.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          poll.is_active 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                        }`}>
                          {poll.is_active ? 'Active' : 'Closed'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => window.open(`/poll/${poll.id}`, '_blank')}
                      >
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/poll/${poll.id}`)
                          // You could add a toast notification here
                        }}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Create Poll Modal */}
      <PollCreateModal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onPollCreated={handlePollCreated}
      />
    </div>
  )
}
