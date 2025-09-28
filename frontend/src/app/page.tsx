/**
 * Home Page Component
 * 
 * This is the main landing page of the Pollaroo application.
 * Features:
 * - Dynamic content for authenticated and non-authenticated users
 * - Hero section with gradient background and animations
 * - Feature showcase cards with hover effects
 * - User authentication modal integration
 * - Trending polls preview for non-authenticated users
 * - User dashboard access for authenticated users
 * - Theme toggle functionality
 * - Responsive design with Tailwind CSS animations
 */
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/store/auth"
import { BarChart3, Users, Zap, Share2, LogOut, User, Eye, Settings, Sparkles, TrendingUp, Shield, Clock } from "lucide-react"

export default function HomePage() {
  // Component state for UI interactions
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { user, isAuthenticated, logout, loadUser, isLoading } = useAuth()

  // Load user data on component mount if token exists
  // This ensures user state is restored on page refresh
  useEffect(() => {
    // Only try to load user if there's a token and we're on client side
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token')
      if (token) {
        loadUser()
      }
    }
  }, [loadUser])

  // Authentication modal handlers
  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Loading state while checking authentication status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-b-2 rounded-full animate-spin border-accent"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="container flex items-center justify-between px-4 py-4 mx-auto">
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-8 h-8 text-accent" />
            <h1 className="text-2xl font-bold">Pollaroo</h1>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                {/* User Avatar + Dropdown */}
                <div className="relative group">
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-accent">
                      <User className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{user?.username}</span>
                  </Button>
                  
                  {/* Enhanced Dropdown Menu */}
                  <div className="absolute right-0 z-50 invisible w-56 mt-2 transition-all duration-200 border rounded-lg shadow-xl opacity-0 top-full bg-card border-border group-hover:opacity-100 group-hover:visible">
                    <div className="py-2">
                      {/* User Info Header */}
                      <div className="px-4 py-3 border-b border-border bg-muted/30">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent">
                            <User className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold truncate">{user?.username}</p>
                            <p className="text-xs truncate text-muted-foreground">{user?.email}</p>
                          </div>
                        </div>
                      </div>
                      
                      {/* Menu Items */}
                      <div className="py-1">
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start w-full h-auto px-4 py-3 hover:bg-accent/10"
                          onClick={() => router.push('/dashboard')}
                        >
                          <div className="flex items-center w-full">
                            <BarChart3 className="flex-shrink-0 w-4 h-4 mr-3 text-accent" />
                            <div className="flex flex-col items-start flex-1 min-w-0">
                              <span className="text-sm font-medium">Dashboard</span>
                              <span className="text-xs text-muted-foreground">Manage your polls</span>
                            </div>
                          </div>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start w-full h-auto px-4 py-3 hover:bg-accent/10"
                          onClick={() => {/* TODO: Implement profile page */}}
                        >
                          <div className="flex items-center w-full">
                            <User className="flex-shrink-0 w-4 h-4 mr-3 text-accent" />
                            <div className="flex flex-col items-start flex-1 min-w-0">
                              <span className="text-sm font-medium">Profile</span>
                              <span className="text-xs text-muted-foreground">View your profile</span>
                            </div>
                          </div>
                        </Button>
                        
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start w-full h-auto px-4 py-3 hover:bg-accent/10"
                          onClick={() => {/* TODO: Implement settings page */}}
                        >
                          <div className="flex items-center w-full">
                            <Settings className="flex-shrink-0 w-4 h-4 mr-3 text-accent" />
                            <div className="flex flex-col items-start flex-1 min-w-0">
                              <span className="text-sm font-medium">Settings</span>
                              <span className="text-xs text-muted-foreground">Account preferences</span>
                            </div>
                          </div>
                        </Button>
                      </div>
                      
                      {/* Logout Section */}
                      <div className="pt-1 border-t border-border">
                        <Button
                          variant="ghost"
                          className="flex items-center justify-start w-full h-auto px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                          onClick={handleLogout}
                        >
                          <div className="flex items-center w-full">
                            <LogOut className="flex-shrink-0 w-4 h-4 mr-3" />
                            <div className="flex flex-col items-start flex-1 min-w-0">
                              <span className="text-sm font-medium">Logout</span>
                              <span className="text-xs text-muted-foreground">Sign out of your account</span>
                            </div>
                          </div>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <>
                <Button variant="ghost" onClick={() => handleAuthClick("login")}>
                  Login
                </Button>
                <Button onClick={() => handleAuthClick("register")}>
                  Sign Up
                </Button>
              </>
            )}
            <ThemeToggle />
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section */}
      <section className="container relative px-4 py-24 mx-auto overflow-hidden text-center">
        {/* Background Elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute rounded-full top-20 left-1/4 w-72 h-72 bg-accent/10 blur-3xl animate-pulse"></div>
          <div className="absolute delay-1000 rounded-full bottom-20 right-1/4 w-96 h-96 bg-blue-500/5 blur-3xl animate-pulse"></div>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Animated Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-medium border rounded-full bg-accent/10 border-accent/20 text-accent animate-fade-in">
            <Sparkles className="w-4 h-4" />
            Now with real-time updates
            <Sparkles className="w-4 h-4" />
          </div>

          {/* Main Heading */}
          <h1 className="mb-6 text-6xl font-black tracking-tight md:text-7xl animate-fade-in-up">
            <span className="text-transparent bg-gradient-to-r from-foreground via-accent to-blue-500 bg-clip-text animate-gradient">
              Create, Share & Vote
            </span>
          </h1>
          
          <h2 className="mb-6 text-3xl font-bold delay-200 md:text-4xl text-muted-foreground animate-fade-in-up">
            In <span className="relative text-accent">
              Real Time
              <svg className="absolute left-0 w-full h-3 -bottom-2 text-accent/30" viewBox="0 0 100 12" fill="currentColor">
                <path d="M2 8c20-4 40-4 60 0s40 4 60 0v4H2z"/>
              </svg>
            </span>
          </h2>
          
          <p className="max-w-3xl mx-auto mb-12 text-xl leading-relaxed delay-300 md:text-2xl text-muted-foreground animate-fade-in-up">
            Build <span className="font-semibold text-foreground">engaging polls</span> with beautiful charts, 
            <span className="font-semibold text-foreground"> real-time updates</span>, and 
            <span className="font-semibold text-foreground"> seamless sharing</span>. 
            Perfect for teams, communities, and decision-making.
          </p>
          
          {/* Enhanced CTA Buttons */}
          <div className="flex flex-col items-center justify-center gap-4 delay-500 sm:flex-row animate-fade-in-up">
            <Button 
              size="lg" 
              className="h-auto px-8 py-6 text-lg transition-all duration-300 transform shadow-lg group bg-gradient-to-r from-accent to-blue-500 hover:from-accent/90 hover:to-blue-500/90 hover:shadow-xl hover:-translate-y-1"
              onClick={() => isAuthenticated ? setIsCreating(true) : handleAuthClick("register")}
            >
              <Zap className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              {isAuthenticated ? "Create New Poll" : "Create Your First Poll"}
              <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="lg" 
              className="h-auto px-8 py-6 text-lg transition-all duration-300 transform border-2 group hover:bg-accent/10 hover:border-accent hover:-translate-y-1"
              onClick={() => router.push('/explore')}
            >
              <Eye className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
              Explore Public Polls
            </Button>
            
            {isAuthenticated && (
              <Button 
                variant="secondary" 
                size="lg" 
                className="h-auto px-8 py-6 text-lg transition-all duration-300 transform group hover:bg-secondary/80 hover:-translate-y-1"
                onClick={() => router.push('/dashboard')}
              >
                <BarChart3 className="w-5 h-5 mr-2 transition-transform group-hover:rotate-12" />
                Dashboard
              </Button>
            )}
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 gap-6 mt-20 delay-700 md:grid-cols-4 animate-fade-in-up">
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">10K+</div>
              <div className="text-sm text-muted-foreground">Polls Created</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">100K+</div>
              <div className="text-sm text-muted-foreground">Votes Cast</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">5K+</div>
              <div className="text-sm text-muted-foreground">Active Users</div>
            </div>
            <div className="text-center">
              <div className="mb-2 text-3xl font-bold text-accent">99.9%</div>
              <div className="text-sm text-muted-foreground">Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="container relative px-4 py-24 mx-auto">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            Why Choose <span className="text-accent">Pollaroo</span>?
          </h2>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">
            Experience the future of polling with powerful features designed for modern teams and communities
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {/* Real-Time Updates */}
          <Card className="relative overflow-hidden transition-all duration-500 border-2 group hover:border-accent/50 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br from-background to-accent/5">
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-accent/5 to-transparent group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-all duration-500 bg-gradient-to-br from-accent to-blue-500 rounded-2xl group-hover:scale-110 group-hover:rotate-6">
                <Zap className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl transition-colors group-hover:text-accent">Real-Time Updates</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <CardDescription className="text-base leading-relaxed">
                Watch votes pour in instantly with live updates. No page refreshes needed - see results change as people vote.
              </CardDescription>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 transform scale-x-0 bg-gradient-to-r from-accent to-blue-500 group-hover:scale-x-100"></div>
          </Card>

          {/* Beautiful Charts */}
          <Card className="relative overflow-hidden transition-all duration-500 border-2 group hover:border-accent/50 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br from-background to-accent/5">
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-accent/5 to-transparent group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-all duration-500 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl group-hover:scale-110 group-hover:rotate-6">
                <BarChart3 className="w-8 h-8 text-white group-hover:animate-bounce" />
              </div>
              <CardTitle className="text-xl transition-colors group-hover:text-accent">Beautiful Charts</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <CardDescription className="text-base leading-relaxed">
                Stunning data visualizations with interactive bar charts, pie charts, and custom themes that match your brand.
              </CardDescription>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 transform scale-x-0 bg-gradient-to-r from-green-500 to-emerald-500 group-hover:scale-x-100"></div>
          </Card>

          {/* Easy Sharing */}
          <Card className="relative overflow-hidden transition-all duration-500 border-2 group hover:border-accent/50 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br from-background to-accent/5">
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-accent/5 to-transparent group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-all duration-500 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl group-hover:scale-110 group-hover:rotate-6">
                <Share2 className="w-8 h-8 text-white group-hover:animate-spin" />
              </div>
              <CardTitle className="text-xl transition-colors group-hover:text-accent">Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <CardDescription className="text-base leading-relaxed">
                Share polls instantly with a single link. Works perfectly on desktop, tablet, and mobile devices.
              </CardDescription>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 transform scale-x-0 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:scale-x-100"></div>
          </Card>

          {/* Community Driven */}
          <Card className="relative overflow-hidden transition-all duration-500 border-2 group hover:border-accent/50 hover:-translate-y-2 hover:shadow-2xl bg-gradient-to-br from-background to-accent/5">
            <div className="absolute inset-0 transition-opacity duration-500 opacity-0 bg-gradient-to-br from-accent/5 to-transparent group-hover:opacity-100"></div>
            <CardHeader className="relative z-10 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 transition-all duration-500 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl group-hover:scale-110 group-hover:rotate-6">
                <Users className="w-8 h-8 text-white group-hover:animate-pulse" />
              </div>
              <CardTitle className="text-xl transition-colors group-hover:text-accent">Community Driven</CardTitle>
            </CardHeader>
            <CardContent className="relative z-10 text-center">
              <CardDescription className="text-base leading-relaxed">
                Join a thriving community with public polls for everyone to discover, participate in, and learn from.
              </CardDescription>
            </CardContent>
            <div className="absolute bottom-0 left-0 right-0 h-1 transition-transform duration-500 transform scale-x-0 bg-gradient-to-r from-orange-500 to-red-500 group-hover:scale-x-100"></div>
          </Card>
        </div>
      </section>

      {/* Enhanced Public Polls Preview */}
      <section className="container relative px-4 py-24 mx-auto bg-gradient-to-b from-transparent via-accent/5 to-transparent">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-4xl font-bold md:text-5xl">
            <TrendingUp className="inline w-10 h-10 mr-3 text-accent" />
            Trending Polls
          </h2>
          <p className="text-xl text-muted-foreground">
            See what the community is talking about right now
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {[
            { 
              title: "What's your favorite programming language?", 
              votes: 1247, 
              time: "2 hours ago",
              options: [
                { name: "JavaScript", percentage: 45, color: "bg-yellow-500" },
                { name: "Python", percentage: 32, color: "bg-green-500" },
                { name: "TypeScript", percentage: 23, color: "bg-blue-500" }
              ]
            },
            { 
              title: "Best framework for web development?", 
              votes: 892, 
              time: "4 hours ago",
              options: [
                { name: "React", percentage: 38, color: "bg-blue-500" },
                { name: "Vue.js", percentage: 35, color: "bg-green-500" },
                { name: "Angular", percentage: 27, color: "bg-red-500" }
              ]
            },
            { 
              title: "Which AI tool do you use most?", 
              votes: 2156, 
              time: "6 hours ago",
              options: [
                { name: "ChatGPT", percentage: 52, color: "bg-purple-500" },
                { name: "GitHub Copilot", percentage: 31, color: "bg-gray-500" },
                { name: "Claude", percentage: 17, color: "bg-orange-500" }
              ]
            }
          ].map((poll, i) => (
            <Card 
              key={i} 
              className="relative overflow-hidden transition-all duration-500 border-2 cursor-pointer group hover:shadow-2xl hover:-translate-y-2 bg-gradient-to-br from-background to-accent/5 hover:border-accent/30"
              onClick={() => router.push('/explore')}
            >
              {/* Trending Badge */}
              <div className="absolute flex items-center gap-1 px-2 py-1 text-xs font-medium text-white rounded-full top-4 right-4 bg-gradient-to-r from-accent to-blue-500">
                <TrendingUp className="w-3 h-3" />
                Hot
              </div>

              <CardHeader>
                <CardTitle className="text-lg leading-tight transition-colors group-hover:text-accent">
                  {poll.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {poll.time}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {poll.votes.toLocaleString()} votes
                  </span>
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {poll.options.map((option, j) => (
                    <div key={j} className="space-y-2">
                      <div className="flex justify-between text-sm font-medium">
                        <span>{option.name}</span>
                        <span className="text-accent">{option.percentage}%</span>
                      </div>
                      <div className="w-full bg-secondary/50 rounded-full h-2.5 overflow-hidden">
                        <div 
                          className={`${option.color} h-2.5 rounded-full transition-all duration-1000 ease-out group-hover:animate-pulse`}
                          style={{ width: `${option.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button 
                  variant="ghost" 
                  className="w-full mt-4 transition-colors group-hover:bg-accent/10 group-hover:text-accent"
                >
                  View Full Results
                  <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
                </Button>
              </CardContent>

              {/* Hover Gradient Overlay */}
              <div className="absolute inset-0 transition-opacity duration-500 opacity-0 pointer-events-none bg-gradient-to-r from-accent/5 via-transparent to-blue-500/5 group-hover:opacity-100"></div>
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="px-8 py-6 text-lg transition-all duration-300 border-2 group hover:border-accent hover:bg-accent/10"
            onClick={() => router.push('/explore')}
          >
            <Eye className="w-5 h-5 mr-2 transition-transform group-hover:scale-110" />
            Explore All Polls
            <span className="ml-2 transition-transform group-hover:translate-x-1">→</span>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-16 border-t">
        <div className="container px-4 py-8 mx-auto">
          <div className="flex flex-col items-center justify-between md:flex-row">
            <div className="flex items-center mb-4 space-x-2 md:mb-0">
              <BarChart3 className="w-6 h-6 text-accent" />
              <span className="font-semibold">Pollaroo</span>
            </div>
            <div className="text-sm text-muted-foreground">
              Built with Next.js 15 & Django 5
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        defaultMode={authMode}
      />
    </div>
  )
}