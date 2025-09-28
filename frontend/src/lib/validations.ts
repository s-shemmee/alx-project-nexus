/**
 * Form Validation Schemas
 * 
 * Zod validation schemas for authentication forms with comprehensive validation rules.
 * These schemas ensure data integrity and provide user-friendly error messages.
 * 
 * Features:
 * - Login validation supporting both email and username formats
 * - Strong password requirements with pattern matching
 * - Username format validation with character restrictions
 * - Email format validation with proper regex patterns
 * - Password confirmation matching for registration
 * - Descriptive error messages for better user experience
 */

import { z } from 'zod'

// Login form validation schema - supports both email and username authentication
export const loginSchema = z.object({
  login: z
    .string()
    .min(1, 'Username or email is required')
    .refine((value) => {
      // Check if it's an email or username
      const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      const isValidUsername = /^[a-zA-Z0-9_.-]+$/.test(value)
      return isEmail || isValidUsername
    }, 'Please enter a valid username or email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must be at least 6 characters'),
})

// Registration form validation schema - comprehensive validation for new user signup
export const registerSchema = z.object({
  username: z
    .string()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must not exceed 30 characters')
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Username can only contain letters, numbers, dots, dashes, and underscores'),
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  password_confirm: z
    .string()
    .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.password_confirm, {
  message: 'Passwords do not match',
  path: ['password_confirm'],
})

// Type definitions
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>