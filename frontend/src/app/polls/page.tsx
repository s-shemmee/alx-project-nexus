"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { apiClient, Poll } from "@/lib/api"
import { BarChart3, Users, Calendar, Search, TrendingUp, Loader2 } from "lucide-react"

export default function PublicPollsPage() {
  const [polls, setPolls] = useState<Poll[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "expired">("all")

  useEffect(() => {
    loadPolls()
  }, [searchQuery, statusFilter])

  const loadPolls = async () => {
    try {
      setIsLoading(true)
      const response = await apiClient.getPolls({
        search: searchQuery || undefined,
        status: statusFilter === "all" ? undefined : statusFilter
      })
      if (response.data) {
        setPolls(response.data)
      }
    } catch (error) {
      console.error('Failed to load polls:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    loadPolls()
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-4">Public Polls</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover and participate in polls created by the community
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <form onSubmit={handleSearch} className="flex-1 flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search polls..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>
          
          <div className="flex gap-2">
            <Button
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
            >
              All
            </Button>
            <Button
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
            >
              Active
            </Button>
            <Button
              variant={statusFilter === "expired" ? "default" : "outline"}
              onClick={() => setStatusFilter("expired")}
            >
              Expired
            </Button>
          </div>
        </div>

        {/* Polls Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading polls...</p>
          </div>
        ) : polls.length === 0 ? (
          <div className="text-center py-12">
            <BarChart3 className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No polls found</h3>
            <p className="text-muted-foreground">
              {searchQuery ? "Try adjusting your search terms" : "Be the first to create a poll!"}
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {polls.map((poll) => (
              <Card key={poll.id} className="hover:shadow-lg transition-shadow cursor-pointer"
                    onClick={() => window.location.href = `/poll/${poll.id}`}>
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
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        poll.is_active 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                      }`}>
                        {poll.is_active ? 'Active' : 'Closed'}
                      </span>
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
                    </div>
                    
                    {/* Poll Options Preview */}
                    {poll.options && poll.options.length > 0 && (
                      <div className="space-y-1">
                        {poll.options.slice(0, 3).map((option, index) => (
                          <div key={option.id} className="flex items-center justify-between text-sm">
                            <span className="truncate flex-1">{option.text}</span>
                            <span className="text-muted-foreground ml-2">
                              {option.vote_count}
                            </span>
                          </div>
                        ))}
                        {poll.options.length > 3 && (
                          <p className="text-xs text-muted-foreground">
                            +{poll.options.length - 3} more options
                          </p>
                        )}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between pt-2">
                      <span className="text-sm text-muted-foreground">
                        by {poll.creator}
                      </span>
                      <Button variant="outline" size="sm">
                        <BarChart3 className="h-4 w-4 mr-2" />
                        View Poll
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
