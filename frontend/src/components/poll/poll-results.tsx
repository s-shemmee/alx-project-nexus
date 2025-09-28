"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Poll } from "@/lib/api"
import { BarChart3, PieChart } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPieChart, Pie, Cell } from "recharts"
import { motion } from "framer-motion"

interface PollResultsProps {
  poll: Poll
  chartType?: "bar" | "pie" | "donut"
  showPercentages?: boolean
}

export function PollResults({ poll, chartType: externalChartType, showPercentages = true }: PollResultsProps) {
  const [internalChartType, setInternalChartType] = useState<"bar" | "pie">("bar")
  
  // Use external chartType if provided, otherwise use internal state
  const activeChartType = externalChartType && (externalChartType === "bar" || externalChartType === "pie") 
    ? externalChartType 
    : internalChartType

  if (!poll.options || poll.options.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No options available</p>
      </div>
    )
  }

  const totalVotes = poll.total_votes || 0

  const colors = [
    "#cba6f7", // mauve
    "#f5c2e7", // pink
    "#89b4fa", // blue
    "#a6e3a1", // green
    "#f9e2af", // yellow
    "#fab387", // peach
    "#f38ba8", // red
    "#94e2d5", // teal
    "#89dceb", // sky
    "#b4befe"  // lavender
  ]

  function getColor(index: number) {
    return colors[index % colors.length]
  }

  // Prepare data for charts
  const chartData = poll.options.map((option, index) => ({
    name: option.text.length > 20 ? option.text.substring(0, 20) + "..." : option.text,
    fullName: option.text,
    votes: option.votes || option.vote_count || 0,
    percentage: totalVotes > 0 ? ((option.votes || option.vote_count || 0) / totalVotes * 100).toFixed(1) : 0,
    color: getColor(index)
  }))

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Chart Type Toggle */}
      <div className="flex justify-center space-x-2">
        <Button
          variant={activeChartType === "bar" ? "default" : "outline"}
          size="sm"
          onClick={() => setInternalChartType("bar")}
        >
          <BarChart3 className="w-4 h-4 mr-2" />
          Bar Chart
        </Button>
        <Button
          variant={activeChartType === "pie" ? "default" : "outline"}
          size="sm"
          onClick={() => setInternalChartType("pie")}
        >
          <PieChart className="w-4 h-4 mr-2" />
          Pie Chart
        </Button>
      </div>

      {/* Chart Visualization */}
      <Card>
        <CardContent className="p-6">
          <div className="h-80">
            {activeChartType === "bar" ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted))" />
                  <XAxis 
                    dataKey="name" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} votes (${props.payload.percentage}%)`,
                      "Votes"
                    ]}
                    labelFormatter={(label: string, payload: any) => {
                      const data = payload?.[0]?.payload
                      return data?.fullName || label
                    }}
                  />
                  <Bar 
                    dataKey="votes" 
                    fill="hsl(var(--accent))"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="votes"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: "hsl(var(--card))",
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                    formatter={(value: number, name: string, props: any) => [
                      `${value} votes (${props.payload.percentage}%)`,
                      "Votes"
                    ]}
                    labelFormatter={(label: string) => label}
                  />
                </RechartsPieChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Results */}
      <div className="space-y-3">
        <h4 className="text-lg font-semibold">Detailed Results</h4>
        {poll.options.map((option, index) => {
          const percentage = totalVotes > 0 ? ((option.votes || option.vote_count || 0) / totalVotes * 100) : 0
          const color = getColor(index)

          return (
            <motion.div
              key={option.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{option.text}</span>
                <span className="text-sm text-muted-foreground">
                  {option.votes || option.vote_count || 0} votes ({percentage.toFixed(1)}%)
                </span>
              </div>
              
              <div className="w-full h-3 rounded-full bg-muted">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                  className="h-3 transition-all duration-500 rounded-full"
                  style={{ backgroundColor: color }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="pt-4 text-center border-t"
      >
        <p className="text-sm text-muted-foreground">
          Total votes: <span className="font-semibold">{totalVotes}</span>
        </p>
        {poll.expires_at && (
          <p className="mt-1 text-sm text-muted-foreground">
            {poll.is_expired ? "Poll has ended" : `Expires ${new Date(poll.expires_at).toLocaleDateString()}`}
          </p>
        )}
      </motion.div>
    </motion.div>
  )
}
