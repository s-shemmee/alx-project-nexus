import React from 'react'
import { apiClient, User } from '@/lib/api'

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
      notify()
      return true
    } else {
      state = {
        ...state,
        error: response.error || 'Login failed',
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
      notify()
      return true
    } else {
      state = {
        ...state,
        error: response.error || 'Registration failed',
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

const logout = async () => {
  state = { ...state, isLoading: true }
  notify()
  
  try {
    await apiClient.logout()
  } catch (error) {
    // Ignore logout errors
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
      }
    } else {
      state = {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      }
    }
  } catch (error) {
    state = {
      ...state,
      user: null,
      isAuthenticated: false,
      isLoading: false,
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