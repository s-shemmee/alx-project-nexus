/**
 * Authentication Store
 * 
 * Lightweight React state management for user authentication without external dependencies.
 * This store handles all authentication-related state and operations.
 * 
 * Features:
 * - JWT token management with localStorage persistence
 * - User registration and login with form validation
 * - Automatic token refresh and session management
 * - Error handling with toast notifications
 * - Profile updates and user data management
 * - React hooks integration for component state updates
 * - Secure logout with token cleanup
 * - Loading states for better UX
 */

import React from 'react'
import { apiClient, User } from '@/lib/api'
import { toast } from 'sonner'

// Authentication state interface
interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

// Authentication actions interface
interface AuthActions {
  login: (credentials: { login: string; password: string }) => Promise<boolean>
  register: (userData: {
    username: string
    email: string
    password: string
    password_confirm: string
  }) => Promise<boolean>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  clearError: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

// Global state management without external dependencies
let state: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

// Component listeners for state updates
const listeners = new Set<() => void>()

// Notify all subscribed components of state changes
const notify = () => {
  listeners.forEach(listener => listener())
}

// User login with email/username support
const login = async (credentials: { login: string; password: string }) => {
  state = { ...state, isLoading: true, error: null }
  notify()
  
  try {
    const response = await apiClient.login(credentials)
    
    if (response.data && 'user' in response.data) {
      state = {
        ...state,
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
      // Show success toast
      toast.success('Welcome back!', {
        description: `Successfully logged in as ${response.data.user.username}`,
        duration: 4000,
        action: {
          label: 'Dashboard',
          onClick: () => window.location.href = '/dashboard',
        },
      })
      notify()
      return true
    } else {
      const errorMessage = response.error || 'Login failed'
      state = {
        ...state,
        error: errorMessage,
        isLoading: false,
      }
      // Show error toast
      toast.error('Login Failed', {
        description: errorMessage,
        duration: 5000,
        action: {
          label: 'Try Again',
          onClick: () => {}, // Handled by retry functionality
        },
      })
      notify()
      return false
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Network error occurred'
    state = {
      ...state,
      error: errorMessage,
      isLoading: false,
    }
    // Show error toast
    toast.error('Network Error', {
      description: errorMessage,
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    })
    notify()
    return false
  }
}

const register = async (userData: {
  username: string
  email: string
  password: string
  password_confirm: string
}) => {
  state = { ...state, isLoading: true, error: null }
  notify()
  
  try {
    const response = await apiClient.register(userData)
    
    if (response.data && 'user' in response.data) {
      state = {
        ...state,
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
      // Show success toast
      toast.success('Account Created!', {
        description: `Welcome to Pollaroo, ${response.data.user.username}! You're now logged in.`,
        duration: 5000,
        action: {
          label: 'Explore',
          onClick: () => window.location.href = '/explore',
        },
      })
      notify()
      return true
    } else {
      const errorMessage = response.error || 'Registration failed'
      state = {
        ...state,
        error: errorMessage,
        isLoading: false,
      }
      // Show error toast
      toast.error('Registration Failed', {
        description: errorMessage,
        duration: 5000,
        action: {
          label: 'Fix Issues',
          onClick: () => {}, // Form error handling managed by form validation
        },
      })
      notify()
      return false
    }
  } catch (error: any) {
    const errorMessage = error?.response?.data?.error || error?.message || 'Network error occurred'
    state = {
      ...state,
      error: errorMessage,
      isLoading: false,
    }
    // Show error toast
    toast.error('Registration Error', {
      description: errorMessage,
      duration: 5000,
      action: {
        label: 'Retry',
        onClick: () => window.location.reload(),
      },
    })
    notify()
    return false
  }
}

const logout = async () => {
  state = { ...state, isLoading: true }
  notify()
  
  try {
    await apiClient.logout()
    // Show success toast
    toast.success('See you later!', {
      description: 'You have been successfully logged out.',
      duration: 3000,
      action: {
        label: 'Login Again',
        onClick: () => window.location.href = '/',
      },
    })
  } catch (error) {
    // Show error toast but still logout locally
    toast.warning('Partial Logout', {
      description: 'Logged out locally, but server logout failed.',
      duration: 4000,
      action: {
        label: 'Dismiss',
        onClick: () => {},
      },
    })
  }
  
  state = {
    ...state,
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,
  }
  notify()
}

const loadUser = async () => {
  // Ensure we're on the client side
  if (typeof window === 'undefined') {
    return
  }
  
  // Check if we have a token in localStorage first
  const token = localStorage.getItem('access_token')
  if (!token) {
    state = {
      ...state,
      user: null,
      isAuthenticated: false,
      isLoading: false,
    }
    notify()
    return
  }

  state = { ...state, isLoading: true }
  notify()
  
  try {
    const response = await apiClient.getProfile()
    
    if (response.data) {
      state = {
        ...state,
        user: response.data,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      }
    } else {
      // Clear invalid token
      if (typeof window !== 'undefined') {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      }
      state = {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
    }
  } catch (error: any) {
    // Clear invalid token on error
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
    }
    state = {
      ...state,
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: error?.message || 'Failed to load user',
    }
  }
  notify()
}

const updateProfile = async (userData: Partial<User>) => {
  state = { ...state, isLoading: true, error: null }
  notify()
  
  try {
    const response = await apiClient.updateProfile(userData)
    
    if (response.data) {
      state = {
        ...state,
        user: response.data,
        isLoading: false,
        error: null,
      }
      notify()
      return true
    } else {
      state = {
        ...state,
        error: response.error || 'Update failed',
        isLoading: false,
      }
      notify()
      return false
    }
  } catch (error) {
    state = {
      ...state,
      error: 'Network error occurred',
      isLoading: false,
    }
    notify()
    return false
  }
}

const clearError = () => {
  state = { ...state, error: null }
  notify()
}

// Hook for React components
export const useAuth = (): AuthState & AuthActions => {
  const [localState, setLocalState] = React.useState<AuthState>(state)
  
  React.useEffect(() => {
    const listener = () => setLocalState({ ...state })
    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  return {
    ...localState,
    login,
    register,
    logout,
    loadUser,
    updateProfile,
    clearError,
  }
}