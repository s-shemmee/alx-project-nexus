"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ThemeToggle } from "@/components/theme-toggle"
import { useAuth } from "@/store/auth"
import { 
  Search, 
  Filter, 
  Clock, 
  Users, 
  TrendingUp, 
  Calendar,
  BarChart3,
  User,
  Eye,
  Settings,
  LogOut
} from "lucide-react"
import { motion } from "framer-motion"

interface Poll {
  id: number
  title: string
  description: string
  creator: {
    username: string
  }
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

export default function ExplorePage() {
  const router = useRouter()
  const { isAuthenticated, user } = useAuth()
  const [polls, setPolls] = useState<Poll[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filter, setFilter] = useState<"newest" | "trending" | "closing">("newest")

  useEffect(() => {
    fetchPolls()
  }, [filter])

  const fetchPolls = async () => {
    try {
      setLoading(true)
      // TODO: Implement API call to fetch public polls
      // For now, using mock data
      const mockPolls: Poll[] = [
        {
          id: 1,
          title: "What's your favorite programming language?",
          description: "Help us understand the community's preferences",
          creator: { username: "dev_user" },
          created_at: "2025-09-28T10:00:00Z",
          expires_at: "2025-10-05T10:00:00Z",
          total_votes: 156,
          is_public: true,
          options: [
            { id: 1, text: "JavaScript", votes: 45 },
            { id: 2, text: "Python", votes: 38 },
            { id: 3, text: "TypeScript", votes: 32 },
            { id: 4, text: "Rust", votes: 25 },
            { id: 5, text: "Go", votes: 16 }
          ]
        },
        {
          id: 2,
          title: "Best framework for web development?",
          description: "Share your experience with different frameworks",
          creator: { username: "web_dev" },
          created_at: "2025-09-27T15:30:00Z",
          total_votes: 89,
          is_public: true,
          options: [
            { id: 6, text: "React", votes: 35 },
            { id: 7, text: "Vue", votes: 28 },
            { id: 8, text: "Angular", votes: 26 }
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

  const filteredPolls = polls.filter(poll =>
    poll.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    poll.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 className="h-8 w-8 text-accent" />
            <h1 className="text-2xl font-bold">Pollaroo</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" onClick={() => router.push('/')}>
              Home
            </Button>
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Avatar + Dropdown */}
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium">{user?.username}</span>
                  </Button>
                  
                  {/* Enhanced Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-card border border-border rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="py-2">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
                            <User className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user?.username}</p>
                            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-3 h-auto hover:bg-accent/10"
                          onClick={() => router.push('/dashboard')}
                        >
                          <BarChart3 className="h-4 w-4 mr-3 text-accent" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">Dashboard</span>
                            <span className="text-xs text-muted-foreground">Manage your polls</span>
                          </div>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-3 h-auto hover:bg-accent/10"
                          onClick={() => {/* TODO: Implement profile page */}}
                        >
                          <User className="h-4 w-4 mr-3 text-accent" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">Profile</span>
                            <span className="text-xs text-muted-foreground">View your profile</span>
                          </div>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-3 h-auto hover:bg-accent/10"
                          onClick={() => {/* TODO: Implement settings page */}}
                        >
                          <Settings className="h-4 w-4 mr-3 text-accent" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">Settings</span>
                            <span className="text-xs text-muted-foreground">Account preferences</span>
                          </div>
                        </Button>
                      </div>
                      
                      {/* Logout Section */}
                      <div className="border-t border-border pt-1">
                        <Button
                          variant="ghost"
                          className="w-full justify-start px-4 py-3 h-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={() => {/* TODO: Implement logout */}}
                        >
                          <LogOut className="h-4 w-4 mr-3" />
                          <div className="flex flex-col items-start">
                            <span className="text-sm font-medium">Logout</span>
                            <span className="text-xs text-muted-foreground">Sign out of your account</span>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => {/* TODO: Implement login */}}>
                  Login
                </Button>
                <Button onClick={() => {/* TODO: Implement register */}}>
                  Sign Up
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Header */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-bold mb-4">Explore Public Polls</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover polls created by the community and share your opinions
            </p>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-col sm:flex-row gap-4 mb-8"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search polls..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filter === "newest" ? "default" : "outline"}
                onClick={() => setFilter("newest")}
                size="sm"
              >
                Newest
              </Button>
              <Button
                variant={filter === "trending" ? "default" : "outline"}
                onClick={() => setFilter("trending")}
                size="sm"
              >
                <TrendingUp className="h-4 w-4 mr-2" />
                Trending
              </Button>
              <Button
                variant={filter === "closing" ? "default" : "outline"}
                onClick={() => setFilter("closing")}
                size="sm"
              >
                <Clock className="h-4 w-4 mr-2" />
                Closing Soon
              </Button>
            </div>
          </motion.div>

          {/* Polls Grid */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
            </div>
          ) : filteredPolls.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12"
            >
              <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No polls found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm ? "Try adjusting your search terms" : "Be the first to create a poll!"}
              </p>
              {!searchTerm && (
                <Button onClick={() => router.push('/')}>
                  Create Your First Poll
                </Button>
              )}
            </motion.div>
          ) : (
            <div className="grid gap-6">
              {filteredPolls.map((poll, index) => (
                <motion.div
                  key={poll.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => router.push(`/poll/${poll.id}`)}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-xl mb-2">{poll.title}</CardTitle>
                          <CardDescription className="text-base mb-3">
                            {poll.description}
                          </CardDescription>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          {poll.expires_at && (
                            <Badge variant="secondary" className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{getTimeRemaining(poll.expires_at)}</span>
                            </Badge>
                          )}
                          <Badge variant="outline" className="flex items-center space-x-1">
                            <Users className="h-3 w-3" />
                            <span>{poll.total_votes} votes</span>
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <User className="h-4 w-4" />
                            <span>by {poll.creator.username}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(poll.created_at)}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>View Poll</span>
                        </div>
                      </div>
                      
                      {/* Poll Options Preview */}
                      <div className="space-y-2">
                        {poll.options.slice(0, 3).map((option) => {
                          const percentage = poll.total_votes > 0 
                            ? Math.round((option.votes / poll.total_votes) * 100) 
                            : 0
                          return (
                            <div key={option.id} className="flex items-center space-x-2">
                              <div className="flex-1 bg-muted rounded-full h-2">
                                <div 
                                  className="bg-accent h-2 rounded-full transition-all duration-300"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium w-12 text-right">
                                {percentage}%
                              </span>
                            </div>
                          )
                        })}
                        {poll.options.length > 3 && (
                          <p className="text-sm text-muted-foreground">
                            +{poll.options.length - 3} more options
                          </p>
                        )}
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
  )
}
