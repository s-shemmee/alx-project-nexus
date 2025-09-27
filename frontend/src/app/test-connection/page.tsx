"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api"

export default function TestConnectionPage() {
  const [status, setStatus] = useState<{
    backend: 'loading' | 'connected' | 'error'
    frontend: 'loading' | 'connected' | 'error'
  }>({
    backend: 'loading',
    frontend: 'loading'
  })

  useEffect(() => {
    // Test backend connection
    const testBackend = async () => {
      try {
        const response = await apiClient.getPolls()
        if (response.data) {
          setStatus(prev => ({ ...prev, backend: 'connected' }))
        } else {
          setStatus(prev => ({ ...prev, backend: 'error' }))
        }
      } catch (error) {
        setStatus(prev => ({ ...prev, backend: 'error' }))
      }
    }

    // Test frontend
    setStatus(prev => ({ ...prev, frontend: 'connected' }))
    
    testBackend()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-600'
      case 'error': return 'text-red-600'
      default: return 'text-yellow-600'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return '✅'
      case 'error': return '❌'
      default: return '⏳'
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center">Connection Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span>Frontend (Next.js)</span>
            <span className={`flex items-center space-x-2 ${getStatusColor(status.frontend)}`}>
              <span>{getStatusIcon(status.frontend)}</span>
              <span className="capitalize">{status.frontend}</span>
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span>Backend (Django API)</span>
            <span className={`flex items-center space-x-2 ${getStatusColor(status.backend)}`}>
              <span>{getStatusIcon(status.backend)}</span>
              <span className="capitalize">{status.backend}</span>
            </span>
          </div>

          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground text-center">
              {status.backend === 'connected' && status.frontend === 'connected' 
                ? '🎉 Frontend and Backend are connected!' 
                : 'Testing connection...'}
            </p>
          </div>

          <Button 
            onClick={() => window.location.href = '/'}
            className="w-full"
          >
            Go to Home
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
