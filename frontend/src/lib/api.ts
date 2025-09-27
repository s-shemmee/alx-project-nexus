const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api'

interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

interface AuthResponse {
  user: User
  tokens: {
    access: string
    refresh: string
  }
}

class ApiClient {
  private baseURL: string
  private token: string | null = null

  constructor(baseURL: string) {
    this.baseURL = baseURL
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('access_token')
    }
  }

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
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    }

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      })

      const data = await response.json()

      if (!response.ok) {
        return { error: data.message || data.error || 'An error occurred' }
      }

      return { data }
    } catch (error) {
      return { error: 'Network error occurred' }
    }
  }

  // Auth endpoints
  async register(userData: {
    username: string
    email: string
    password: string
    password_confirm: string
    first_name?: string
    last_name?: string
  }) {
    return this.request<AuthResponse>('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    })
  }

  async login(credentials: { username: string; password: string }) {
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

  async updatePoll(id: number, pollData: Partial<Poll>) {
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
  vote_count: number
  vote_percentage: number
}

export interface Poll {
  id: number
  title: string
  description?: string
  creator: string
  is_public: boolean
  expires_at?: string
  created_at: string
  updated_at?: string
  options?: Option[]
  total_votes: number
  is_active: boolean
  is_expired: boolean
}
