/**
 * Footer Component
 * 
 * A minimalist footer with consistent branding across the application.
 * Features:
 * - Logo on the left
 * - Empty center space for clean design
 * - Copyright information on the right
 * - Responsive design that adapts to mobile screens
 */

import { BarChart3 } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="mt-16 border-t">
      <div className="container px-4 py-8 mx-auto">
        <div className="flex flex-col items-center justify-between space-y-4 md:flex-row md:space-y-0">
          {/* Logo on the left */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-6 h-6 text-accent" />
            <span className="font-semibold">Pollaroo</span>
          </div>
          
          {/* Empty center space for minimalist design - hidden on mobile */}
          <div className="hidden md:flex md:flex-1"></div>
          
          {/* Copyright on the right */}
          <div className="text-sm text-muted-foreground">
            {currentYear} Pollaroo. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  )
}