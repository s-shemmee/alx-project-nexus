"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Poll } from "@/lib/api"
import { BarChart3, PieChart } from "@/components/icons"

interface PollResultsProps {
  poll: Poll
}

export function PollResults({ poll }: PollResultsProps) {
  const [chartType, setChartType] = useState<"bar" | "pie">("bar")

  if (!poll.options || poll.options.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">No options available</p>
      </div>
    )
  }

  const totalVotes = poll.total_votes || 0

  return (
    <div className="space-y-6">
      {/* Chart Type Toggle */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={chartType === "bar" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("bar")}
        >
          <BarChart3 className="h-4 w-4 mr-2" />
          Bar Chart
        </Button>
        <Button
          variant={chartType === "pie" ? "default" : "outline"}
          size="sm"
          onClick={() => setChartType("pie")}
        >
          <PieChart className="h-4 w-4 mr-2" />
          Pie Chart
        </Button>
      </div>

      {/* Results */}
      <div className="space-y-4">
        {poll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? option.vote_percentage : 0
          const colors = [
            "bg-mocha-mauve",
            "bg-mocha-pink", 
            "bg-mocha-blue",
            "bg-mocha-green",
            "bg-mocha-yellow",
            "bg-mocha-peach",
            "bg-mocha-red",
            "bg-mocha-teal",
            "bg-mocha-sky",
            "bg-mocha-lavender"
          ]
          const colorClass = colors[index % colors.length]

          return (
            <div key={option.id} className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">{option.text}</span>
                <span className="text-sm text-muted-foreground">
                  {option.vote_count} votes ({percentage.toFixed(1)}%)
                </span>
              </div>
              
              {chartType === "bar" ? (
                <div className="w-full bg-secondary rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${colorClass} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <div className={`w-4 h-4 rounded-full ${colorClass}`} />
                  <div className="flex-1 bg-secondary rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colorClass} transition-all duration-500`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      <div className="text-center pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Total votes: <span className="font-semibold">{totalVotes}</span>
        </p>
        {poll.expires_at && (
          <p className="text-sm text-muted-foreground mt-1">
            {poll.is_expired ? "Poll has ended" : `Expires ${new Date(poll.expires_at).toLocaleDateString()}`}
          </p>
        )}
      </div>
    </div>
  )
}
