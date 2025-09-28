/**
 * Root Layout Component
 * 
 * The main layout wrapper for the entire Pollaroo application.
 * This layout provides global configurations and providers.
 * 
 * Features:
 * - Inter font integration for consistent typography
 * - Dark theme as default with system theme detection
 * - Sonner toast notifications provider
 * - Hydration mismatch prevention for SSR compatibility
 * - Global CSS styles and Tailwind CSS integration
 * - SEO metadata configuration
 * - Theme persistence across page refreshes
 */

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Configure Inter font with Latin subset for optimal performance
const inter = Inter({ subsets: ["latin"] });

// SEO metadata for the application
export const metadata: Metadata = {
  title: "Pollaroo - Create, Share & Vote in Real Time",
  description: "A full-stack polling application with real-time updates and beautiful charts.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        {/* Theme provider with dark mode as default */}
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          {/* Global toast notification system */}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}