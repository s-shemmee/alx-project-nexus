"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ThemeToggle } from "@/components/theme-toggle"
import { AuthModal } from "@/components/auth/auth-modal"
import { useAuth } from "@/store/auth"
import { BarChart3, Users, Zap, Share2, LogOut, User, Eye, Settings } from "lucide-react"

export default function HomePage() {
  const router = useRouter()
  const [isCreating, setIsCreating] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)
  const [authMode, setAuthMode] = useState<"login" | "register">("login")
  const { user, isAuthenticated, logout, loadUser, isLoading } = useAuth()

  useEffect(() => {
    // Only try to load user if there's a token
    const token = localStorage.getItem('access_token')
    if (token) {
      loadUser()
    }
  }, [loadUser])

  // No automatic redirect - let users stay on home page if they want

  const handleAuthClick = (mode: "login" | "register") => {
    setAuthMode(mode)
    setAuthModalOpen(true)
  }

  const handleLogout = async () => {
    await logout()
  }

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div>
          <span>Loading...</span>
        </div>
      </div>
    )
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
                          onClick={handleLogout}
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

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-accent to-mocha-pink bg-clip-text text-transparent">
            Create, Share & Vote
          </h1>
          <h2 className="text-2xl text-muted-foreground mb-8">
            In Real Time
          </h2>
          <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto">
            Build engaging polls with beautiful charts, real-time updates, and seamless sharing. 
            Perfect for teams, communities, and decision-making.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => isAuthenticated ? setIsCreating(true) : handleAuthClick("register")}
            >
              {isAuthenticated ? "Create New Poll" : "Create Your First Poll"}
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="text-lg px-8 py-6"
              onClick={() => router.push('/explore')}
            >
              Explore Public Polls
            </Button>
            {isAuthenticated && (
              <Button 
                variant="secondary" 
                size="lg" 
                className="text-lg px-8 py-6"
                onClick={() => router.push('/dashboard')}
              >
                Go to Dashboard
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Pollaroo?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="text-center">
            <CardHeader>
              <Zap className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle>Real-Time Updates</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                See votes come in live as they happen. No refresh needed.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle>Beautiful Charts</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Stunning visualizations with bar charts, pie charts, and more.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Share2 className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle>Easy Sharing</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Share polls with a single link. Works on any device.
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-accent mx-auto mb-4" />
              <CardTitle>Community Driven</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Public polls for everyone to discover and participate in.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Public Polls Preview */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Trending Polls</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg">
                  What's your favorite programming language?
                </CardTitle>
                <CardDescription>
                  Created 2 hours ago • 127 votes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>JavaScript</span>
                    <span>45%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: "45%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <BarChart3 className="h-6 w-6 text-accent" />
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