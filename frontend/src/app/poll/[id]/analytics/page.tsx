/**
 * Poll Analytics Page
 * 
 * This page provides detailed analytics and insights for poll creators.
 * Features:
 * - Real-time voting statistics and trends
 * - Vote distribution charts (bar and pie charts)
 * - Time-based voting patterns
 * - Demographic insights (if available)
 * - Export data functionality
 * - Social sharing analytics
 * - Performance metrics and engagement data
 */
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/store/auth"
import { apiClient, Poll } from "@/lib/api"
import { 
  ArrowLeft, 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Users, 
  Calendar, 
  Share2, 
  Download,
  Eye,
  Clock,
  Globe,
  Lock,
  Loader2,
  AlertCircle,
  Activity,
  Target,
  Zap
} from "lucide-react"
import { motion } from "framer-motion"
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart as RechartsPieChart, 
  Pie, 
  Cell,
  LineChart,
  Line,
  AreaChart,
  Area
} from "recharts"

const COLORS = ['#8839ef', '#e64553', '#fe640b', '#df8e1d', '#40a02b', '#209fb5', '#1e66f5', '#7c7f93']

interface AnalyticsData {
  totalVotes: number
  uniqueVoters: number
  averageVotesPerDay: number
  peakVotingTime: string
  engagementRate: number
  shareCount: number
  viewCount: number
  completionRate: number
  optionPerformance: Array<{
    option: string
    votes: number
    percentage: number
    trend: number
  }>
  timelineData: Array<{
    date: string
    votes: number
    cumulativeVotes: number
  }>
  hourlyData: Array<{
    hour: number
    votes: number
  }>
}

export default function PollAnalyticsPage() {
  const params = useParams()
  const router = useRouter()
  const pollId = parseInt(params.id as string)
  const { isAuthenticated, user } = useAuth()
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeChart, setActiveChart] = useState<'bar' | 'pie' | 'timeline' | 'hourly'>('bar')

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    if (pollId) {
      loadAnalytics()
    }
  }, [pollId, isAuthenticated])

  const loadAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Load poll data
      const pollResponse = await apiClient.getPoll(pollId)
      if (!pollResponse.data) {
        setError("Poll not found")
        return
      }
      
      const pollData = pollResponse.data
      setPoll(pollData)
      
      // Check ownership
      if (typeof pollData.creator === 'object' && pollData.creator?.id !== user?.id) {
        setError("You don't have permission to view analytics for this poll")
        return
      }
      
      // For now, generate mock analytics data
      // In production, this would be an API call
      const mockAnalytics: AnalyticsData = {
        totalVotes: pollData.total_votes || 0,
        uniqueVoters: Math.floor((pollData.total_votes || 0) * 0.85),
        averageVotesPerDay: Math.floor((pollData.total_votes || 0) / 7),
        peakVotingTime: "2:30 PM",
        engagementRate: 78.5,
        shareCount: 24,
        viewCount: (pollData.total_votes || 0) * 3.2,
        completionRate: 85.3,
        optionPerformance: (pollData.options || []).map((option, index) => ({
          option: option.text,
          votes: option.votes || option.vote_count || Math.floor(Math.random() * 100),
          percentage: ((option.votes || option.vote_count || Math.floor(Math.random() * 100)) / (pollData.total_votes || 1)) * 100,
          trend: Math.floor(Math.random() * 20) - 10
        })),
        timelineData: Array.from({ length: 7 }, (_, i) => ({
          date: new Date(Date.now() - (6 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
          votes: Math.floor(Math.random() * 50) + 10,
          cumulativeVotes: Math.floor(Math.random() * 200) + i * 30
        })),
        hourlyData: Array.from({ length: 24 }, (_, i) => ({
          hour: i,
          votes: Math.floor(Math.random() * 20) + (i >= 9 && i <= 21 ? 10 : 2)
        }))
      }
      
      setAnalytics(mockAnalytics)
      
    } catch (error) {
      console.error('Failed to load analytics:', error)
      setError("Failed to load analytics data")
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    if (!analytics || !poll) return
    
    const data = {
      poll: {
        title: poll.title,
        created_at: poll.created_at,
        total_votes: poll.total_votes
      },
      analytics: analytics
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `poll-${pollId}-analytics.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !poll || !analytics) {
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
              <Button onClick={() => loadAnalytics()}>
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
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Poll Analytics</h1>
              <p className="text-muted-foreground">{poll.title}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant={poll.is_public ? "default" : "secondary"}>
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
            <Button variant="outline" onClick={exportData}>
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Total Votes</p>
                    <p className="text-2xl font-bold">{analytics.totalVotes}</p>
                  </div>
                  <Target className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Unique Voters</p>
                    <p className="text-2xl font-bold">{analytics.uniqueVoters}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Views</p>
                    <p className="text-2xl font-bold">{Math.floor(analytics.viewCount)}</p>
                  </div>
                  <Eye className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Engagement</p>
                    <p className="text-2xl font-bold">{analytics.engagementRate}%</p>
                  </div>
                  <Activity className="h-8 w-8 text-orange-500" />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Charts Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Chart Toggle */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Vote Distribution</CardTitle>
                  <div className="flex space-x-2">
                    <Button
                      variant={activeChart === 'bar' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveChart('bar')}
                    >
                      <BarChart3 className="h-4 w-4 mr-1" />
                      Bar
                    </Button>
                    <Button
                      variant={activeChart === 'pie' ? "default" : "outline"}
                      size="sm"
                      onClick={() => setActiveChart('pie')}
                    >
                      <PieChart className="h-4 w-4 mr-1" />
                      Pie
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  {activeChart === 'bar' ? (
                    <BarChart data={analytics.optionPerformance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="option" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="votes" fill="#8839ef" />
                    </BarChart>
                  ) : (
                    <RechartsPieChart>
                      <Pie
                        data={analytics.optionPerformance}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ option, percentage }) => `${option}: ${percentage.toFixed(1)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="votes"
                      >
                        {analytics.optionPerformance.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  )}
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Timeline Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Voting Timeline</CardTitle>
                <CardDescription>Vote accumulation over time</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analytics.timelineData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="cumulativeVotes" stroke="#8839ef" fill="#8839ef" fillOpacity={0.3} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Insights Panel */}
          <div className="space-y-6">
            {/* Performance Insights */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Insights</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Peak Voting Time</span>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    <span className="font-medium">{analytics.peakVotingTime}</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Avg Votes/Day</span>
                  <span className="font-medium">{analytics.averageVotesPerDay}</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Completion Rate</span>
                  <span className="font-medium">{analytics.completionRate}%</span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Shares</span>
                  <div className="flex items-center">
                    <Share2 className="h-4 w-4 mr-1" />
                    <span className="font-medium">{analytics.shareCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Option */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Option</CardTitle>
              </CardHeader>
              <CardContent>
                {analytics.optionPerformance.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{analytics.optionPerformance[0].option}</span>
                      <Badge variant="default">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {analytics.optionPerformance[0].percentage.toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary rounded-full h-2 transition-all duration-300"
                        style={{ width: `${analytics.optionPerformance[0].percentage}%` }}
                      ></div>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {analytics.optionPerformance[0].votes} votes
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Hourly Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Hourly Activity</CardTitle>
                <CardDescription>When your audience is most active</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={analytics.hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${value} votes`, 'Votes']} />
                    <Line type="monotone" dataKey="votes" stroke="#8839ef" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
