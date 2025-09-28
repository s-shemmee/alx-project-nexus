import React from 'react'
import { apiClient, User } from '@/lib/api'
import { toast } from 'sonner'

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

interface AuthActions {
  login: (credentials: { username: string; password: string }) => Promise<boolean>
  register: (userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name?: string
    last_name?: string
  }) => Promise<boolean>
  logout: () => Promise<void>
  loadUser: () => Promise<void>
  clearError: () => void
  updateProfile: (userData: Partial<User>) => Promise<boolean>
}

// Simple state management without external dependencies
let state: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
}

const listeners = new Set<() => void>()

const notify = () => {
  listeners.forEach(listener => listener())
}

const login = async (credentials: { username: string; password: string }) => {
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
      toast.success(`Welcome back, ${response.data.user.username}!`)
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
      toast.error(`Login Failed: ${errorMessage}`)
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
    toast.error(`Login Failed: ${errorMessage}`)
    notify()
    return false
  }
}

const register = async (userData: {
  username: string
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
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
      toast.success(`Welcome to Pollaroo, ${response.data.user.username}!`)
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
      toast.error(`Registration Failed: ${errorMessage}`)
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
    toast.error(`Registration Failed: ${errorMessage}`)
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
    toast.success("You have been successfully logged out.")
  } catch (error) {
    // Show error toast but still logout locally
    toast.warning("Logged out locally, but server logout failed.")
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
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      state = {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
    }
  } catch (error: any) {
    // Clear invalid token on error
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
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