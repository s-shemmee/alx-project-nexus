"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { PollCreateModal } from "@/components/poll/poll-create-modal"
import { useAuth } from "@/store/auth"
import { 
  BarChart3, 
  Loader2, 
  Plus, 
  Eye, 
  Share2, 
  Trash2, 
  Edit,
  Calendar,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  User,
  Home,
  Menu,
  X,
  Clock,
  Globe,
  Lock,
  MoreVertical,
  Copy,
  ExternalLink,
  Heart,
  MessageCircle,
  Activity
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Poll as ApiPoll } from "@/lib/api"

interface Poll {
  id: number
  title: string
  description: string
  created_at: string
  expires_at?: string
  total_votes: number
  is_public: boolean
  options: Array<{
    id: number
    text: string
    votes: number
  }>
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarExpanded, setSidebarExpanded] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPolls()
    }
  }, [isAuthenticated])

  // Auto close sidebar on desktop, auto open on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarExpanded(false) // Close on desktop
      } else {
        setSidebarExpanded(false) // Keep closed on mobile initially
      }
    }

    // Set initial state based on screen size
    if (window.innerWidth >= 1024) {
      setSidebarExpanded(false) // Desktop: closed
    } else {
      setSidebarExpanded(false) // Mobile: closed by default
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const fetchUserPolls = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to fetch user's polls
      // For now, using mock data
      const mockPolls: Poll[] = [
        {
          id: 1,
          title: "Team Meeting Time Preference",
          description: "What time works best for our weekly team meetings?",
          created_at: "2025-09-28T10:00:00Z",
          expires_at: "2025-10-05T10:00:00Z",
          total_votes: 12,
          is_public: true,
          options: [
            { id: 1, text: "Monday 9 AM", votes: 3 },
            { id: 2, text: "Tuesday 2 PM", votes: 5 },
            { id: 3, text: "Wednesday 10 AM", votes: 4 }
          ]
        },
        {
          id: 2,
          title: "Project Technology Stack",
          description: "Which technologies should we use for the new project?",
          created_at: "2025-09-27T15:30:00Z",
          total_votes: 8,
          is_public: false,
          options: [
            { id: 4, text: "React + Node.js", votes: 4 },
            { id: 5, text: "Vue + Python", votes: 3 },
            { id: 6, text: "Angular + Java", votes: 1 }
          ]
        }
      ]
      setPolls(mockPolls)
    } catch (error) {
      console.error("Failed to fetch polls:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    router.push('/')
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const getTimeRemaining = (expiresAt?: string) => {
    if (!expiresAt) return null
    const now = new Date()
    const expiry = new Date(expiresAt)
    const diff = expiry.getTime() - now.getTime()
    
    if (diff <= 0) return "Expired"
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}d ${hours}h left`
    return `${hours}h left`
  }

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Show access denied if not authenticated
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
      {/* Mobile Header */}
      <div className="lg:hidden border-b p-4 flex items-center justify-between bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent/80 rounded-lg flex items-center justify-center">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Pollaroo</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="hover:bg-accent/10 p-2"
          >
            {sidebarExpanded ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex">
        {/* Enhanced Sidebar */}
        {/* Desktop Sidebar - Always visible on desktop */}
        <div className="hidden lg:flex w-80 bg-card/95 backdrop-blur-sm border-r border-border/50 flex-col h-screen sticky top-0 shadow-xl">
          {/* Sidebar Header */}
          <div className="p-6 border-b">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Pollaroo</h1>
                <p className="text-sm text-muted-foreground">Dashboard</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-6 space-y-1">
            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
              onClick={() => router.push('/')}
            >
              <Home className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="font-medium">Home</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
              onClick={() => router.push('/explore')}
            >
              <Eye className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="font-medium">Explore Polls</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
            >
              <TrendingUp className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="font-medium">Analytics</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
            >
              <Activity className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="font-medium">Activity</span>
            </Button>

            <Button
              variant="ghost"
              className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
            >
              <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
              <span className="font-medium">Settings</span>
            </Button>
          </nav>

          {/* User Section */}
          <div className="p-6 border-t">
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center space-x-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{user?.username}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0"
                onClick={handleLogout}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              initial={{ x: -280, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -280, opacity: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden bg-card/95 backdrop-blur-sm border-r border-border/50 flex flex-col h-screen fixed top-0 left-0 z-50 w-80 shadow-2xl"
            >
              {/* Mobile Sidebar Content - Same as desktop but with close button */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold">Pollaroo</h1>
                      <p className="text-sm text-muted-foreground">Dashboard</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSidebarExpanded(false)}
                    className="lg:hidden hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-950/20"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6 space-y-1">
                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
                  onClick={() => {
                    router.push('/')
                    setSidebarExpanded(false)
                  }}
                >
                  <Home className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">Home</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
                  onClick={() => {
                    router.push('/explore')
                    setSidebarExpanded(false)
                  }}
                >
                  <Eye className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">Explore Polls</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <TrendingUp className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">Analytics</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <Activity className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">Activity</span>
                </Button>

                <Button
                  variant="ghost"
                  className="w-full justify-start h-12 hover:bg-accent/10 text-left px-4 transition-all duration-200 hover:translate-x-1"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <Settings className="h-5 w-5 mr-3 flex-shrink-0" />
                  <span className="font-medium">Settings</span>
                </Button>
              </nav>

              {/* User Section */}
              <div className="p-6 border-t">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.username}</p>
                      <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20 flex-shrink-0"
                    onClick={() => {
                      handleLogout()
                      setSidebarExpanded(false)
                    }}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Mobile Overlay */}
        <AnimatePresence>
          {sidebarExpanded && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden"
              onClick={() => setSidebarExpanded(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex-1 flex flex-col min-h-screen">
          {/* Desktop Header */}
          <header className="hidden lg:flex border-b p-6 items-center justify-between bg-card/50 backdrop-blur-sm">
            <div className="flex items-center space-x-4">
              <div>
                <h2 className="text-3xl font-bold bg-gradient-to-r from-accent to-accent/70 bg-clip-text text-transparent">
                  My Polls
                </h2>
                <p className="text-muted-foreground">Manage and track your polls</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create Poll
              </Button>
              <ThemeToggle />
            </div>
          </header>

          {/* Stats Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center">
                      <BarChart3 className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{polls.length}</p>
                      <p className="text-sm text-muted-foreground">Total Polls</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-gradient-to-br from-green-500/10 to-green-500/5 border-green-500/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-green-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{polls.reduce((sum, poll) => sum + poll.total_votes, 0)}</p>
                      <p className="text-sm text-muted-foreground">Total Votes</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card className="p-6 bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-blue-500/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Globe className="h-6 w-6 text-blue-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{polls.filter(poll => poll.is_public).length}</p>
                      <p className="text-sm text-muted-foreground">Public Polls</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-gradient-to-br from-orange-500/10 to-orange-500/5 border-orange-500/20">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-orange-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="h-6 w-6 text-orange-500" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{polls.filter(poll => poll.expires_at && new Date(poll.expires_at) > new Date()).length}</p>
                      <p className="text-sm text-muted-foreground">Active Polls</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-accent" />
                  <p className="text-muted-foreground">Loading your polls...</p>
                </div>
              </div>
            ) : polls.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-16"
              >
                <div className="w-24 h-24 bg-gradient-to-br from-accent/20 to-accent/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <BarChart3 className="h-12 w-12 text-accent" />
                </div>
                <h3 className="text-2xl font-bold mb-3">No polls yet</h3>
                <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                  Create your first poll to start engaging with your audience and gathering valuable insights.
                </p>
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
                  size="lg"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Create Your First Poll
                </Button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {polls.map((poll, index) => (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50 hover:border-accent/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center space-x-2">
                            {poll.is_public ? (
                              <Globe className="h-4 w-4 text-green-500" />
                            ) : (
                              <Lock className="h-4 w-4 text-orange-500" />
                            )}
                            <Badge variant={poll.is_public ? "default" : "secondary"} className="text-xs">
                              {poll.is_public ? "Public" : "Private"}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <CardTitle className="text-lg leading-tight mb-2 group-hover:text-accent transition-colors">
                          {poll.title}
                        </CardTitle>
                        <CardDescription className="text-sm line-clamp-2">
                          {poll.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Poll Stats */}
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Users className="h-4 w-4" />
                              <span className="font-medium">{poll.total_votes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="h-4 w-4" />
                              <span>{poll.options.length}</span>
                            </div>
                          </div>
                          {poll.expires_at && (
                            <div className="flex items-center space-x-1 text-orange-500">
                              <Clock className="h-4 w-4" />
                              <span className="text-xs">{getTimeRemaining(poll.expires_at)}</span>
                            </div>
                          )}
                        </div>

                        {/* Top Options Preview */}
                        <div className="space-y-2 mb-4">
                          {poll.options.slice(0, 2).map((option, optionIndex) => {
                            const percentage = poll.total_votes > 0 
                              ? Math.round((option.votes / poll.total_votes) * 100) 
                              : 0
                            return (
                              <div key={option.id} className="space-y-1">
                                <div className="flex items-center justify-between text-xs">
                                  <span className="truncate flex-1 mr-2">{option.text}</span>
                                  <span className="font-medium text-accent">{percentage}%</span>
                                </div>
                                <div className="w-full bg-muted rounded-full h-2">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: optionIndex * 0.2 }}
                                    className="bg-gradient-to-r from-accent to-accent/80 h-2 rounded-full"
                                  />
                                </div>
                              </div>
                            )
                          })}
                          {poll.options.length > 2 && (
                            <p className="text-xs text-muted-foreground">
                              +{poll.options.length - 2} more options
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-2 pt-4 border-t">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-accent/10 hover:border-accent/30"
                            onClick={() => router.push(`/poll/${poll.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-green-50 hover:border-green-300 hover:text-green-600"
                            onClick={() => {/* TODO: Implement share */}}
                          >
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
                            onClick={() => {/* TODO: Implement edit */}}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                            onClick={() => {/* TODO: Implement delete */}}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Create Poll Modal */}
      {showCreateModal && (
        <PollCreateModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onPollCreated={(poll: ApiPoll) => {
            setShowCreateModal(false)
            fetchUserPolls()
          }}
        />
      )}
    </div>
  )
}