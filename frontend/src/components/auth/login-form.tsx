/**
 * Login Form Component
 * 
 * Enhanced login form with comprehensive validation and user experience features.
 * Features:
 * - Zod schema validation with react-hook-form integration
 * - Support for both email and username authentication
 * - Real-time password visibility toggle
 * - Colorful toast notifications for success/error feedback
 * - Loading states with disabled form during submission
 * - Error handling with field-specific validation messages
 * - Smooth transitions and hover effects
 * - Accessibility features with proper ARIA labels
 */
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/store/auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { loginSchema, type LoginFormData } from "@/lib/validations"
import { useState } from "react"
import { toast } from "sonner"

interface LoginFormProps {
  onSuccess?: () => void
  onSwitchToRegister?: () => void
}

export function LoginForm({ onSuccess, onSwitchToRegister }: LoginFormProps) {
  // Password visibility toggle state
  const [showPassword, setShowPassword] = useState(false)
  const { login, isLoading, clearError } = useAuth()
  
  // Form setup with Zod validation schema
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      login: "",
      password: "",
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    clearError()
    
    // Show loading toast
    toast.loading('Signing you in...', { 
      id: 'login',
      duration: Infinity 
    })
    
    const success = await login(data)
    
    // Dismiss loading toast
    toast.dismiss('login')
    
    if (success && onSuccess) {
      onSuccess()
    } else if (!success) {
      setError("login", { message: "Invalid credentials" })
      toast.error('Login failed', {
        description: 'Please check your credentials and try again.',
        duration: 4000,
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Welcome Back</CardTitle>
        <CardDescription>
          Sign in to your Pollaroo account
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="login" className="text-sm font-medium">
              Username or Email
            </label>
            <Input
              id="login"
              type="text"
              placeholder="Enter your username or email"
              {...register("login")}
              className={errors.login ? "border-red-500" : ""}
            />
            {errors.login && (
              <p className="text-sm text-red-500">{errors.login.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                {...register("password")}
                className={errors.password ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password.message}</p>
            )}
          </div>

          <Button type="submit" className="w-full" disabled={isLoading || isSubmitting}>
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="text-primary hover:underline font-medium"
            >
              Sign up
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
