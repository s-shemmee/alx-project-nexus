/**
 * Dashboard Page - Main interface for authenticated users
 * Features: Poll management, search, responsive design, real-time updates
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { PollCreateModal } from "@/components/poll/poll-create-modal"
import { PollShare } from "@/components/poll/poll-share"
import { PollDelete } from "@/components/poll/poll-delete"
import { Footer } from "@/components/footer"
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
  Activity,
  Search
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Poll as ApiPoll, apiClient } from "@/lib/api"
import { toast } from "sonner"

// Poll interface definition for type safety
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
  const { user, isAuthenticated, isLoading: authLoading, logout, loadUser } = useAuth()
  
  // Component state management
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [sidebarExpanded, setSidebarExpanded] = useState(false) // Manual toggle state
  const [sidebarHovered, setSidebarHovered] = useState(false) // Auto-hover state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState("") // Real-time search filtering
  
  // Modal states for poll actions
  const [shareModalOpen, setShareModalOpen] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedPoll, setSelectedPoll] = useState<Poll | null>(null)

  // Fetch user polls when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchUserPolls()
    }
  }, [isAuthenticated])

  // Load user data on component mount if token exists
  // This ensures user state is restored on page refresh or direct navigation
  useEffect(() => {
    // Only try to load user if there's a token and we're on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        loadUser()
      }
    }
  }, [loadUser])

  // Responsive sidebar behavior: collapsed by default on all screen sizes
  // Users can manually toggle or auto-hover to expand
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

  // Fetch user's polls from the API
  const fetchUserPolls = async () => {
    try {
      setLoading(true)
      const response = await apiClient.getUserPolls()
      
      // Handle both direct array and paginated response
      let pollsData: ApiPoll[] = []
      
      if (response.data) {
        if (Array.isArray(response.data)) {
          pollsData = response.data
        } else if (typeof response.data === 'object' && 'results' in response.data && Array.isArray((response.data as any).results)) {
          pollsData = (response.data as any).results
        }
      }
      
      if (pollsData.length > 0) {
        const convertedPolls: Poll[] = pollsData.map((apiPoll: ApiPoll) => ({
          id: apiPoll.id,
          title: apiPoll.title,
          description: apiPoll.description || "",
          created_at: apiPoll.created_at,
          expires_at: apiPoll.expires_at || undefined,
          total_votes: apiPoll.total_votes,
          is_public: apiPoll.is_public,
          options: apiPoll.options.map(option => ({
            id: option.id,
            text: option.text,
            votes: option.votes || option.vote_count || 0
          }))
        }))
        
        setPolls(convertedPolls)
      } else if (response.data) {
        toast.error("No polls found", {
          description: "You haven't created any polls yet."
        })
        setPolls([])
      } else {
        toast.error("Failed to load your polls", {
          description: response.error || "Please try refreshing the page."
        })
        setPolls([])
      }
    } catch (error) {
      toast.error("Network error", {
        description: "Could not connect to the server. Please check your internet connection."
      })
      setPolls([])
    } finally {
      setLoading(false)
    }
  }

  // Poll action handlers
  const handleSharePoll = (poll: Poll) => {
    setSelectedPoll(poll)
    setShareModalOpen(true)
  }

  const handleEditPoll = (poll: Poll) => {
    router.push(`/poll/${poll.id}/edit`)
  }

  const handleDeletePoll = (poll: Poll) => {
    setSelectedPoll(poll)
    setDeleteModalOpen(true)
  }

  const handleViewPoll = (poll: Poll) => {
    router.push(`/poll/${poll.id}`)
  }

  const handleDeleteSuccess = () => {
    // Remove the deleted poll from the current state
    if (selectedPoll) {
      setPolls(currentPolls => currentPolls.filter(poll => poll.id !== selectedPoll.id))
      toast.success(`Poll "${selectedPoll.title}" deleted successfully`, {
        description: "The poll has been permanently removed."
      })
      
      // Refresh the polls list to ensure consistency
      setTimeout(() => {
        fetchUserPolls()
      }, 500)
    }
    setDeleteModalOpen(false)
    setSelectedPoll(null)
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

  // Filter polls based on search term
  const filteredPolls = polls.filter(poll => 
    poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poll.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  // Show access denied if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
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
      <div className="sticky top-0 z-40 flex items-center justify-between p-4 border-b lg:hidden bg-card/50 backdrop-blur-sm">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-accent to-accent/80">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold">Pollaroo</h1>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarExpanded(!sidebarExpanded)}
            className="p-2 hover:bg-accent/10"
          >
            {sidebarExpanded ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <div className="flex">
        {/* Enhanced Sidebar */}
        {/* Desktop Sidebar - Collapsible with hover */}
        <div 
          className={`hidden lg:flex ${sidebarHovered ? 'w-80' : 'w-20'} bg-card/95 backdrop-blur-sm border-r border-border/50 flex-col h-screen sticky top-0 shadow-xl transition-all duration-300 ease-in-out overflow-hidden`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* Sidebar Header */}
          <div className={`${sidebarHovered ? 'p-6' : 'p-3'} border-b transition-all duration-300`}>
            <div className="flex items-center justify-center">
              <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              {sidebarHovered && (
                <div className="ml-3 transition-all duration-300">
                  <h1 className="text-xl font-bold whitespace-nowrap">Pollaroo</h1>
                  <p className="text-sm text-muted-foreground whitespace-nowrap">Dashboard</p>
                </div>
              )}
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-3 space-y-1">
            {/* Home */}
            <div className="relative group">
              <Button
                variant="ghost"
                className={`w-full h-12 hover:bg-accent/10 transition-all duration-300 flex items-center ${sidebarHovered ? 'justify-start px-3' : 'justify-center px-0'}`}
                onClick={() => router.push('/')}
              >
                <Home className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover:text-accent" />
                {sidebarHovered && (
                  <span className="flex-1 ml-3 font-medium text-left">Home</span>
                )}
                {/* Tooltip for collapsed state */}
                {!sidebarHovered && (
                  <div className="absolute z-50 px-2 py-1 ml-2 text-sm transition-opacity duration-200 rounded shadow-lg opacity-0 pointer-events-none left-full bg-popover text-popover-foreground group-hover:opacity-100 whitespace-nowrap">
                    Home
                  </div>
                )}
              </Button>
            </div>

            {/* Explore Polls */}
            <div className="relative group">
              <Button
                variant="ghost"
                className={`w-full h-12 hover:bg-accent/10 transition-all duration-300 flex items-center ${sidebarHovered ? 'justify-start px-3' : 'justify-center px-0'}`}
                onClick={() => router.push('/explore')}
              >
                <Eye className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover:text-accent" />
                {sidebarHovered && (
                  <span className="flex-1 ml-3 font-medium text-left">Explore Polls</span>
                )}
                {!sidebarHovered && (
                  <div className="absolute z-50 px-2 py-1 ml-2 text-sm transition-opacity duration-200 rounded shadow-lg opacity-0 pointer-events-none left-full bg-popover text-popover-foreground group-hover:opacity-100 whitespace-nowrap">
                    Explore Polls
                  </div>
                )}
              </Button>
            </div>

            {/* Analytics */}
            <div className="relative group">
              <Button
                variant="ghost"
                className={`w-full h-12 hover:bg-accent/10 transition-all duration-300 flex items-center ${sidebarHovered ? 'justify-start px-3' : 'justify-center px-0'}`}
              >
                <TrendingUp className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover:text-accent" />
                {sidebarHovered && (
                  <span className="flex-1 ml-3 font-medium text-left">Analytics</span>
                )}
                {!sidebarHovered && (
                  <div className="absolute z-50 px-2 py-1 ml-2 text-sm transition-opacity duration-200 rounded shadow-lg opacity-0 pointer-events-none left-full bg-popover text-popover-foreground group-hover:opacity-100 whitespace-nowrap">
                    Analytics
                  </div>
                )}
              </Button>
            </div>

            {/* Activity */}
            <div className="relative group">
              <Button
                variant="ghost"
                className={`w-full h-12 hover:bg-accent/10 transition-all duration-300 flex items-center ${sidebarHovered ? 'justify-start px-3' : 'justify-center px-0'}`}
              >
                <Activity className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover:text-accent" />
                {sidebarHovered && (
                  <span className="flex-1 ml-3 font-medium text-left">Activity</span>
                )}
                {!sidebarHovered && (
                  <div className="absolute z-50 px-2 py-1 ml-2 text-sm transition-opacity duration-200 rounded shadow-lg opacity-0 pointer-events-none left-full bg-popover text-popover-foreground group-hover:opacity-100 whitespace-nowrap">
                    Activity
                  </div>
                )}
              </Button>
            </div>

            {/* Settings */}
            <div className="relative group">
              <Button
                variant="ghost"
                className={`w-full h-12 hover:bg-accent/10 transition-all duration-300 flex items-center ${sidebarHovered ? 'justify-start px-3' : 'justify-center px-0'}`}
              >
                <Settings className="flex-shrink-0 w-5 h-5 text-muted-foreground group-hover:text-accent" />
                {sidebarHovered && (
                  <span className="flex-1 ml-3 font-medium text-left">Settings</span>
                )}
                {!sidebarHovered && (
                  <div className="absolute z-50 px-2 py-1 ml-2 text-sm transition-opacity duration-200 rounded shadow-lg opacity-0 pointer-events-none left-full bg-popover text-popover-foreground group-hover:opacity-100 whitespace-nowrap">
                    Settings
                  </div>
                )}
              </Button>
            </div>
          </nav>

          {/* User Section */}
          <div className="px-2 py-3 border-t">
            <div className="relative group">
              {sidebarHovered ? (
                <div className="flex items-center p-3 transition-all duration-300 rounded-lg bg-muted/50">
                  <div className="flex items-center flex-1 min-w-0 space-x-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.username}</p>
                      <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="flex-shrink-0 w-10 h-10 p-0 ml-2 text-red-600 transition-all duration-300 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <Button
                    variant="ghost"
                    className="flex items-center justify-center w-full h-10 text-red-600 transition-all duration-300 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-950/20 group/logout"
                    onClick={handleLogout}
                  >
                    <LogOut className="w-5 h-5" />
                    <div className="absolute z-50 px-2 py-1 ml-2 text-sm transition-opacity duration-200 rounded shadow-lg opacity-0 pointer-events-none left-full bg-popover text-popover-foreground group-hover/logout:opacity-100 whitespace-nowrap">
                      Logout
                    </div>
                  </Button>
                </div>
              )}
              
              {/* Tooltip for user profile when collapsed */}
              {!sidebarHovered && (
                <div className="absolute z-50 px-2 py-1 ml-2 text-sm transition-opacity duration-200 rounded shadow-lg opacity-0 pointer-events-none left-full bg-popover text-popover-foreground group-hover:opacity-100 whitespace-nowrap top-3">
                  {user?.username}
                </div>
              )}
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
              className="fixed top-0 left-0 z-50 flex flex-col h-screen border-r shadow-2xl lg:hidden bg-card/95 backdrop-blur-sm border-border/50 w-80"
            >
              {/* Mobile Sidebar Content - Same as desktop but with close button */}
              <div className="p-6 border-b">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-accent to-accent/80 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-white" />
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
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              {/* Navigation */}
              <nav className="flex-1 p-6 space-y-1">
                <Button
                  variant="ghost"
                  className="justify-start w-full h-12 px-4 text-left transition-all duration-200 hover:bg-accent/10 hover:translate-x-1"
                  onClick={() => {
                    router.push('/')
                    setSidebarExpanded(false)
                  }}
                >
                  <Home className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span className="font-medium">Home</span>
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start w-full h-12 px-4 text-left transition-all duration-200 hover:bg-accent/10 hover:translate-x-1"
                  onClick={() => {
                    router.push('/explore')
                    setSidebarExpanded(false)
                  }}
                >
                  <Eye className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span className="font-medium">Explore Polls</span>
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start w-full h-12 px-4 text-left transition-all duration-200 hover:bg-accent/10 hover:translate-x-1"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <TrendingUp className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span className="font-medium">Analytics</span>
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start w-full h-12 px-4 text-left transition-all duration-200 hover:bg-accent/10 hover:translate-x-1"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <Activity className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span className="font-medium">Activity</span>
                </Button>

                <Button
                  variant="ghost"
                  className="justify-start w-full h-12 px-4 text-left transition-all duration-200 hover:bg-accent/10 hover:translate-x-1"
                  onClick={() => setSidebarExpanded(false)}
                >
                  <Settings className="flex-shrink-0 w-5 h-5 mr-3" />
                  <span className="font-medium">Settings</span>
                </Button>
              </nav>

              {/* User Section */}
              <div className="p-6 border-t">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex items-center flex-1 min-w-0 space-x-3">
                    <div className="flex items-center justify-center flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent to-accent/80">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{user?.username}</p>
                      <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="flex-shrink-0 w-8 h-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={() => {
                      handleLogout()
                      setSidebarExpanded(false)
                    }}
                  >
                    <LogOut className="w-4 h-4" />
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
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              onClick={() => setSidebarExpanded(false)}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <div className="flex flex-col flex-1 min-h-screen">
          {/* Desktop Header */}
          <header className="items-center justify-between hidden p-6 border-b lg:flex bg-card/50 backdrop-blur-sm">
            {/* Left Section - Title */}
            <div className="flex-1">
              <div>
                <h2 className="text-3xl font-bold text-transparent bg-gradient-to-r from-accent to-accent/70 bg-clip-text">
                  My Polls
                </h2>
                <p className="text-muted-foreground">Manage and track your polls</p>
              </div>
            </div>
            
            {/* Center Section - Enhanced Search Bar */}
            <div className="flex justify-center flex-1 px-8">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <Search className="w-5 h-5 text-muted-foreground" />
                </div>
                <input
                  type="text"
                  placeholder="Search your polls..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 pl-12 pr-4 text-sm transition-all duration-200 border shadow-sm border-border bg-background rounded-xl placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent hover:shadow-md"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 flex items-center pr-4 transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
            
            {/* Right Section - Actions */}
            <div className="flex justify-end flex-1">
              <div className="flex items-center space-x-4">
                <Button 
                  onClick={() => setShowCreateModal(true)}
                  className="transition-all duration-200 shadow-lg bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent hover:shadow-xl"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Poll
                </Button>
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Stats Cards */}
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-accent/20 rounded-xl">
                      <BarChart3 className="w-6 h-6 text-accent" />
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
                    <div className="flex items-center justify-center w-12 h-12 bg-green-500/20 rounded-xl">
                      <Users className="w-6 h-6 text-green-500" />
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
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-500/20 rounded-xl">
                      <Globe className="w-6 h-6 text-blue-500" />
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
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-500/20 rounded-xl">
                      <TrendingUp className="w-6 h-6 text-orange-500" />
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
                  <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin text-accent" />
                  <p className="text-muted-foreground">Loading your polls...</p>
                </div>
              </div>
            ) : filteredPolls.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-16 text-center"
              >
                <div className="flex items-center justify-center w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-accent/20 to-accent/10 rounded-3xl">
                  {searchTerm ? <Search className="w-12 h-12 text-accent" /> : <BarChart3 className="w-12 h-12 text-accent" />}
                </div>
                <h3 className="mb-3 text-2xl font-bold">
                  {searchTerm ? 'No polls found' : 'No polls yet'}
                </h3>
                <p className="max-w-md mx-auto mb-8 text-muted-foreground">
                  {searchTerm 
                    ? `No polls match "${searchTerm}". Try searching with different keywords.`
                    : 'Create your first poll to start engaging with your audience and gathering valuable insights.'
                  }
                </p>
                {!searchTerm && (
                  <Button 
                    onClick={() => setShowCreateModal(true)}
                    className="bg-gradient-to-r from-accent to-accent/90 hover:from-accent/90 hover:to-accent"
                    size="lg"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Create Your First Poll
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                {filteredPolls.map((poll, index) => (
                  <motion.div
                    key={poll.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="group"
                  >
                    <Card className="h-full hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border-border/50 hover:border-accent/30">
                      <CardHeader className="pb-4">
                        <div className="flex items-start justify-between mb-4">
                          {/* Left side - empty for balance */}
                          <div></div>
                          
                          {/* Right side - Public/Private badge */}
                          <div className="flex items-center space-x-2">
                            {poll.is_public ? (
                              <Globe className="w-4 h-4 text-green-500" />
                            ) : (
                              <Lock className="w-4 h-4 text-orange-500" />
                            )}
                            <Badge variant={poll.is_public ? "default" : "secondary"} className="text-xs">
                              {poll.is_public ? "Public" : "Private"}
                            </Badge>
                          </div>
                        </div>
                        
                        <CardTitle className="mb-3 text-xl leading-tight transition-colors group-hover:text-accent">
                          {poll.title}
                        </CardTitle>
                        <CardDescription className="mb-4 text-sm line-clamp-2">
                          {poll.description}
                        </CardDescription>
                      </CardHeader>

                      <CardContent className="pt-0">
                        {/* Enhanced Poll Stats */}
                        <div className="flex items-center justify-between mb-5 text-sm text-muted-foreground">
                          <div className="flex items-center space-x-6">
                            <div className="flex items-center px-3 py-1 space-x-2 rounded-full bg-accent/10">
                              <Users className="w-4 h-4 text-accent" />
                              <span className="font-semibold text-accent">{poll.total_votes}</span>
                              <span className="text-xs">votes</span>
                            </div>
                            <div className="flex items-center px-3 py-1 space-x-2 rounded-full bg-blue-500/10">
                              <MessageCircle className="w-4 h-4 text-blue-500" />
                              <span className="font-semibold text-blue-500">{poll.options.length}</span>
                              <span className="text-xs">options</span>
                            </div>
                          </div>
                          {poll.expires_at && (
                            <div className="flex items-center px-2 py-1 space-x-1 bg-orange-100 rounded-full dark:bg-orange-900/20">
                              <Clock className="w-4 h-4 text-orange-500" />
                              <span className="text-xs font-medium text-orange-600 dark:text-orange-400">{getTimeRemaining(poll.expires_at)}</span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Options Preview - Show 3 instead of 2 */}
                        <div className="mb-6 space-y-3">
                          {poll.options.slice(0, 3).map((option, optionIndex) => {
                            const percentage = poll.total_votes > 0 
                              ? Math.round((option.votes / poll.total_votes) * 100) 
                              : 0
                            return (
                              <div key={option.id} className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="flex-1 mr-3 font-medium truncate">{option.text}</span>
                                  <span className="px-2 py-1 text-xs font-bold rounded-full text-accent bg-accent/10">{percentage}%</span>
                                </div>
                                <div className="w-full bg-muted/50 rounded-full h-2.5 overflow-hidden">
                                  <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${percentage}%` }}
                                    transition={{ duration: 0.8, delay: optionIndex * 0.15 }}
                                    className="bg-gradient-to-r from-accent to-accent/80 h-2.5 rounded-full shadow-sm"
                                  />
                                </div>
                              </div>
                            )
                          })}
                          {poll.options.length > 3 && (
                            <div className="flex items-center justify-center py-2">
                              <span className="px-3 py-1 text-xs rounded-full text-muted-foreground bg-muted/50">
                                +{poll.options.length - 3} more option{poll.options.length - 3 > 1 ? 's' : ''}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Enhanced Actions */}
                        <div className="flex items-center pt-5 space-x-2 border-t border-border/50">
                          <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 hover:bg-accent/10 hover:border-accent/30 h-9"
                            onClick={() => handleViewPoll(poll)}
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3 h-9 hover:bg-green-50 hover:border-green-300 hover:text-green-600 dark:hover:bg-green-950/20"
                            onClick={() => handleSharePoll(poll)}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3 h-9 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 dark:hover:bg-blue-950/20"
                            onClick={() => handleEditPoll(poll)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-3 h-9 hover:bg-red-50 hover:border-red-300 hover:text-red-600 dark:hover:bg-red-950/20"
                            onClick={() => handleDeletePoll(poll)}
                          >
                            <Trash2 className="w-4 h-4" />
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
            // Convert API poll to dashboard poll format and add to the list
            const newPoll: Poll = {
              id: poll.id,
              title: poll.title,
              description: poll.description || "",
              created_at: poll.created_at,
              expires_at: poll.expires_at || undefined,
              total_votes: poll.total_votes,
              is_public: poll.is_public,
              options: poll.options.map(option => ({
                id: option.id,
                text: option.text,
                votes: option.votes || option.vote_count || 0
              }))
            }
            
            // Add the new poll to the beginning of the list for immediate visibility
            setPolls(currentPolls => [newPoll, ...currentPolls])
            setShowCreateModal(false)
            
            // Show success feedback
            toast.success(`Poll "${poll.title}" created successfully! 🎉`, {
              description: "Your poll is now live and ready for votes."
            })
          }}
        />
      )}

      {/* Share Poll Modal */}
      {shareModalOpen && selectedPoll && (
        <PollShare
          isOpen={shareModalOpen}
          onClose={() => {
            setShareModalOpen(false)
            setSelectedPoll(null)
          }}
          poll={selectedPoll}
          pollUrl={`${typeof window !== 'undefined' ? window.location.origin : ''}/poll/${selectedPoll.id}`}
        />
      )}

      {/* Delete Poll Modal */}
      {deleteModalOpen && selectedPoll && (
        <PollDelete
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false)
            setSelectedPoll(null)
          }}
          poll={selectedPoll}
          onDeleteSuccess={handleDeleteSuccess}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  )
}