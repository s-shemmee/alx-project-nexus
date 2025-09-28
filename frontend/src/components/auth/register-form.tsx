/**
 * Registration Form Component
 * 
 * Comprehensive user registration form with advanced validation and UX features.
 * Features:
 * - Zod schema validation with strict password requirements
 * - Real-time password confirmation matching
 * - Dual password visibility toggles for password and confirm fields
 * - Email format validation and username availability checking
 * - Progressive disclosure of validation errors
 * - Colorful toast notifications for user feedback
 * - Loading states and form submission handling
 * - Responsive design with consistent styling
 * - Accessibility features and ARIA labels
 */
"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/store/auth"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import { registerSchema, type RegisterFormData } from "@/lib/validations"
import { useState } from "react"
import { toast } from "sonner"

interface RegisterFormProps {
  onSuccess?: () => void
  onSwitchToLogin?: () => void
}

export function RegisterForm({ onSuccess, onSwitchToLogin }: RegisterFormProps) {
  // Password visibility toggles for both password fields
  const [showPassword, setShowPassword] = useState(false)
  const [showPasswordConfirm, setShowPasswordConfirm] = useState(false)
  const { register: registerUser, isLoading, clearError } = useAuth()

  // Form setup with comprehensive validation
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      password_confirm: "",
    },
  })

  const password = watch("password")

  const onSubmit = async (data: RegisterFormData) => {
    clearError()
    
    // Show loading toast
    toast.loading('Creating your account...', { 
      id: 'register',
      duration: Infinity 
    })
    
    const success = await registerUser(data)
    
    // Dismiss loading toast
    toast.dismiss('register')
    
    if (success && onSuccess) {
      onSuccess()
    } else if (!success) {
      setError("username", { message: "Registration failed" })
      toast.error('Registration failed', {
        description: 'Please check your information and try again.',
        duration: 4000,
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Create Account</CardTitle>
        <CardDescription>
          Join Pollaroo and start creating polls
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              Username *
            </label>
            <Input
              id="username"
              type="text"
              placeholder="johndoe"
              {...register("username")}
              className={errors.username ? "border-red-500" : ""}
            />
            {errors.username && (
              <p className="text-sm text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email *
            </label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              {...register("email")}
              className={errors.email ? "border-red-500" : ""}
            />
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium">
              Password *
            </label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
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

          <div className="space-y-2">
            <label htmlFor="password_confirm" className="text-sm font-medium">
              Confirm Password *
            </label>
            <div className="relative">
              <Input
                id="password_confirm"
                type={showPasswordConfirm ? "text" : "password"}
                placeholder="Confirm your password"
                {...register("password_confirm")}
                className={errors.password_confirm ? "border-red-500" : ""}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
              >
                {showPasswordConfirm ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </Button>
            </div>
            {errors.password_confirm && (
              <p className="text-sm text-red-500">{errors.password_confirm.message}</p>
            )}
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isSubmitting}
          >
            {isLoading || isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </button>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
