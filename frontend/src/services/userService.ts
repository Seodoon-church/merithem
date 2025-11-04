import { api } from './api'

export interface UserProfile {
  id: string
  email: string
  name: string
  phone?: string
  role: string
  language?: string
  created_at: string
  birth_date?: string
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'
  skin_type?: 'dry' | 'oily' | 'combination' | 'sensitive' | 'normal'
  skin_concerns?: string[]
  allergies?: string[]
  avatar_url?: string
  bio?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface UpdateProfileData {
  name?: string
  phone?: string
  language?: string
  birth_date?: string
  gender?: string
  skin_type?: string
  skin_concerns?: string[]
  allergies?: string[]
  bio?: string
  address_line1?: string
  address_line2?: string
  city?: string
  state?: string
  postal_code?: string
  country?: string
}

export interface ChangePasswordData {
  currentPassword: string
  newPassword: string
}

export const userService = {
  async getProfile(): Promise<{ status: string; data: { user: UserProfile } }> {
    return await api.get('/users/profile')
  },

  async updateProfile(data: UpdateProfileData): Promise<{ status: string; message: string; data: { user: UserProfile } }> {
    return await api.put('/users/profile', data)
  },

  async changePassword(data: ChangePasswordData): Promise<{ status: string; message: string }> {
    return await api.post('/users/change-password', data)
  },

  async deleteAccount(password: string): Promise<{ status: string; message: string }> {
    return await api.delete('/users/account', { data: { password } })
  },
}
