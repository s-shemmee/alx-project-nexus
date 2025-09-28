/**
 * Poll Results Page
 * 
 * Enhanced poll results page with detailed visualization and sharing options.
 * Features:
 * - Interactive charts (bar, pie, donut)
 * - Real-time vote counts and percentages
 * - Social sharing integration
 * - Export results functionality
 * - Vote timeline if available
 * - Winner announcement for completed polls
 * - Responsive design with animations
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/store/auth"
import { apiClient, Poll } from "@/lib/api"
import { PollResults } from "@/components/poll/poll-results"
import { PollShare } from "@/components/poll/poll-share"
import { 
  ArrowLeft, 
  Share2, 
  Download, 
  Trophy, 
  Users, 
  Calendar, 
  Clock, 
  BarChart3,
  PieChart,
  Loader2,
  AlertCircle,
  Globe,
  Lock,
  TrendingUp,
  Eye,
  Copy,
  CheckCircle,
  RefreshCw
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { toast } from "sonner"

export default function PollResultsPage() {
  const params = useParams()
  const router = useRouter()
  const pollId = parseInt(params.id as string)
  const { isAuthenticated } = useAuth()
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [chartType, setChartType] = useState<'bar' | 'pie' | 'donut'>('bar')
  const [showPercentages, setShowPercentages] = useState(true)

  useEffect(() => {
    if (pollId) {
      loadPoll()
    }
  }, [pollId])

  const loadPoll = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true)
      } else {
        setIsLoading(true)
      }
      setError(null)
      
      const response = await apiClient.getPoll(pollId)
      if (response.data) {
        setPoll(response.data)
      } else {
        setError(response.error || "Poll not found")
      }
    } catch (error) {
      console.error('Failed to load poll:', error)
      setError("Failed to load poll results")
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  const handleRefresh = () => {
    loadPoll(true)
    toast.success("Results refreshed!", { duration: 2000 })
  }

  const copyShareLink = async () => {
    const url = `${window.location.origin}/poll/${pollId}`
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Link copied to clipboard! 📋")
    } catch (error) {
      toast.error("Failed to copy link")
    }
  }

  const exportResults = () => {
    if (!poll) return
    
    const resultsData = {
      poll: {
        id: poll.id,
        title: poll.title,
        description: poll.description,
        created_at: poll.created_at,
        expires_at: poll.expires_at,
        total_votes: poll.total_votes,
        is_public: poll.is_public
      },
      options: poll.options.map(option => ({
        text: option.text,
        votes: option.votes || option.vote_count || 0,
        percentage: poll.total_votes > 0 ? (((option.votes || option.vote_count || 0) / poll.total_votes) * 100).toFixed(2) : 0
      })),
      winner: poll.options.reduce((prev, current) => 
        (prev.votes || prev.vote_count || 0) > (current.votes || current.vote_count || 0) ? prev : current
      ),
      exportedAt: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(resultsData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poll-${pollId}-results.json`
    a.click()
    URL.revokeObjectURL(url)
    
    toast.success("Results exported successfully! 📊")
  }

  const getWinner = () => {
    if (!poll || poll.total_votes === 0) return null
    return poll.options.reduce((prev, current) => 
      (prev.votes || prev.vote_count || 0) > (current.votes || current.vote_count || 0) ? prev : current
    )
  }

  const isExpired = () => {
    if (!poll?.expires_at) return false
    return new Date(poll.expires_at) < new Date()
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading poll results...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !poll) {
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

  const winner = getWinner()
  const expired = isExpired()

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Poll Results</h1>
              <p className="text-muted-foreground">{poll.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={copyShareLink}>
              <Copy className="h-4 w-4 mr-2" />
              Copy Link
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShareModalOpen(true)}>
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
            <Button variant="outline" size="sm" onClick={exportResults}>
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Poll Info */}
        <div className="grid gap-6 mb-8 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                  <p className="text-2xl font-bold">{poll.total_votes}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Options</p>
                  <p className="text-2xl font-bold">{poll.options.length}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Status</p>
                  <Badge variant={expired ? "secondary" : "default"} className="mt-1">
                    {expired ? "Ended" : "Active"}
                  </Badge>
                </div>
                <Clock className="h-8 w-8 text-orange-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Visibility</p>
                  <Badge variant={poll.is_public ? "default" : "secondary"} className="mt-1">
                    {poll.is_public ? (
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
                {poll.is_public ? (
                  <Eye className="h-8 w-8 text-purple-500" />
                ) : (
                  <Lock className="h-8 w-8 text-gray-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Winner Announcement */}
        <AnimatePresence>
          {winner && poll.total_votes > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-8"
            >
              <Card className="border-yellow-200 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-950/20 dark:to-amber-950/20">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Trophy className="h-8 w-8 text-yellow-500" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                        Leading Option
                      </h3>
                      <p className="text-yellow-700 dark:text-yellow-300">
                        "<strong>{winner.text}</strong>" is currently winning with{' '}
                        <strong>{winner.votes || winner.vote_count || 0} votes</strong>{' '}
                        ({poll.total_votes > 0 ? (((winner.votes || winner.vote_count || 0) / poll.total_votes) * 100).toFixed(1) : 0}%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Results Visualization */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Vote Distribution</CardTitle>
                    <CardDescription>
                      Results visualization with real-time data
                    </CardDescription>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      variant={chartType === 'bar' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType('bar')}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Bar
                    </Button>
                    <Button
                      variant={chartType === 'pie' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setChartType('pie')}
                    >
                      <PieChart className="h-4 w-4 mr-1" />
                      Pie
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <PollResults 
                  poll={poll} 
                  chartType={chartType}
                  showPercentages={showPercentages}
                />
              </CardContent>
            </Card>
          </div>

          {/* Poll Details & Settings */}
          <div className="space-y-6">
            {/* Poll Information */}
            <Card>
              <CardHeader>
                <CardTitle>Poll Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Created</p>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span className="text-sm">
                      {new Date(poll.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {poll.expires_at && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      {expired ? "Ended" : "Expires"}
                    </p>
                    <div className="flex items-center mt-1">
                      <Clock className="h-4 w-4 mr-2" />
                      <span className="text-sm">
                        {new Date(poll.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}

                {poll.description && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Description</p>
                    <p className="text-sm mt-1">{poll.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Display Options */}
            <Card>
              <CardHeader>
                <CardTitle>Display Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Show Percentages</span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPercentages}
                      onChange={(e) => setShowPercentages(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => router.push(`/poll/${pollId}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Poll
                </Button>
                
                {isAuthenticated && (
                  <>
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push(`/poll/${pollId}/analytics`)}
                    >
                      <TrendingUp className="h-4 w-4 mr-2" />
                      Analytics
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start"
                      onClick={() => router.push(`/poll/${pollId}/edit`)}
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Edit Poll
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <PollShare
        isOpen={shareModalOpen}
        onClose={() => setShareModalOpen(false)}
        poll={poll}
        pollUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/poll/${pollId}`}
      />
    </div>
  )
}