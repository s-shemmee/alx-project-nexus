/**
 * API Client Configuration
 * 
 * Centralized API client for communication with the Django backend.
 * Handles authentication, token management, and HTTP requests.
 * 
 * Features:
 * - JWT token authentication with automatic header injection
 * - Request/response interceptors for error handling
 * - TypeScript interfaces for type safety
 * - Automatic token storage and retrieval from localStorage
 * - Environment-based API URL configuration
 * - Error response handling with proper error types
 * - Support for all CRUD operations (GET, POST, PUT, DELETE)
 * - User authentication and profile management endpoints
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

// Generic API response interface
interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Authentication response interface
interface AuthResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

// API Client class for handling HTTP requests
class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    // Initialize token from localStorage on client-side
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token')
    }
  }

  // Set authentication token and persist to localStorage
  setToken(token: string) {
    this.token = token
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token)
    }
  }

  clearToken() {
    this.token = null
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token')
    }
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        // Better error handling for different response codes
        if (response.status === 401) {
          // Token is invalid or expired
          this.clearToken()
          return { error: 'Authentication expired. Please log in again.' }
        } else if (response.status >= 500) {
          return { error: 'Server error. Please try again later.' }
        } else if (response.status === 404) {
          return { error: 'Endpoint not found.' }
        } else {
          return { error: data.message || data.error || data.detail || `Request failed with status ${response.status}` }
        }
      }

      return { data }
    } catch (error) {
      // More specific network error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        return { error: 'Cannot connect to server. Please check if the backend server is running.' }
      }
      console.error('API Request Error:', error)
      return { error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}` }
    }
  }

    // Auth endpoints
  async register(userData: {
    username: string
    email: string
    password: string
    password_confirm: string
  }) {
    return this.request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { login: string; password: string }) {
    const response = await this.request<AuthResponse>('/auth/login/', {
      method: 'POST',
      body: JSON.stringify(credentials),
    })

    if (response.data?.tokens?.access) {
      this.setToken(response.data.tokens.access)
    }

    return response
  }

  async logout() {
    const response = await this.request('/auth/logout/', {
      method: 'POST',
    })
    this.clearToken()
    return response
  }

  async getProfile() {
    return this.request<User>('/auth/profile/')
  }

  async updateProfile(userData: Partial<User>) {
    return this.request<User>('/auth/me/update/', {
      method: 'PUT',
      body: JSON.stringify(userData),
    })
  }

  // Poll endpoints
  async getPolls(params?: { search?: string; status?: string }) {
    const searchParams = new URLSearchParams()
    if (params?.search) searchParams.append('search', params.search)
    if (params?.status) searchParams.append('status', params.status)
    
    const query = searchParams.toString()
    return this.request<Poll[]>(`/polls/${query ? `?${query}` : ''}`)
  }

  async getPoll(id: number) {
    return this.request<Poll>(`/polls/${id}/`)
  }

  async createPoll(pollData: {
    title: string
    description?: string
    options: string[]
    is_public: boolean
    expires_at?: string
  }) {
    return this.request<Poll>('/polls/create/', {
      method: 'POST',
      body: JSON.stringify(pollData),
    })
  }

  async updatePoll(id: number, pollData: PollUpdate) {
    return this.request<Poll>(`/polls/${id}/update/`, {
      method: 'PUT',
      body: JSON.stringify(pollData),
    })
  }

  async deletePoll(id: number) {
    return this.request(`/polls/${id}/delete/`, {
      method: 'DELETE',
    })
  }

  async getUserPolls() {
    return this.request<Poll[]>('/polls/my-polls/')
  }

  async vote(pollId: number, optionId: number) {
    return this.request(`/polls/${pollId}/vote/`, {
      method: 'POST',
      body: JSON.stringify({ option_id: optionId }),
    })
  }

  async getPollResults(pollId: number) {
    return this.request<Poll>(`/polls/${pollId}/results/`)
  }

  async getPollShareLink(pollId: number) {
    return this.request<{ poll_id: number; share_url: string; title: string }>(
      `/polls/${pollId}/share/`
    )
  }
}

export const apiClient = new ApiClient(API_BASE_URL)

// Types
export interface User {
  id: number
  username: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  avatar?: string
  bio?: string
  date_joined: string
  created_at: string
}

export interface Option {
  id: number
  text: string
  votes: number  // Changed from vote_count to votes for consistency
  vote_count?: number  // Keep both for backward compatibility
  vote_percentage?: number
}

// Flexible option interface for updates
export interface OptionUpdate {
  id?: number
  text: string
  votes?: number
  vote_count?: number
}

// Flexible poll interface for updates
export interface PollUpdate {
  title?: string
  description?: string
  options?: OptionUpdate[]
  is_public?: boolean
  expires_at?: string | null
}

export interface Poll {
  id: number
  title: string
  description?: string
  creator: { 
    id: number
    username: string
  } | string  // Allow both object and string for creator
  is_public: boolean
  expires_at?: string | null  // Allow null for better compatibility
  created_at: string
  updated_at?: string
  options: Option[]  // Make required, not optional
  total_votes: number
  is_active: boolean
  is_expired: boolean
  has_voted?: boolean  // Track if current user has voted
}
