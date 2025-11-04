import { api } from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
  phone?: string
  language?: string
}

export interface AuthResponse {
  status: string
  message: string
  data: {
    user: User
    accessToken: string
    refreshToken: string
  }
}

export interface User {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  language?: string
}

export const authService = {
  async register(data: RegisterData): Promise<AuthResponse> {
    return await api.post<AuthResponse>('/auth/register', data)
  },

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    return await api.post<AuthResponse>('/auth/login', credentials)
  },

  async logout(refreshToken: string): Promise<void> {
    await api.post('/auth/logout', { refreshToken })
  },

  async getCurrentUser(): Promise<{ status: string; data: { user: User } }> {
    return await api.get('/auth/me')
  },

  async refreshToken(refreshToken: string): Promise<{ status: string; data: { accessToken: string } }> {
    return await api.post('/auth/refresh', { refreshToken })
  },
}
