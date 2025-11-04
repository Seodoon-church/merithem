export type { User } from '../services/authService'
export type { UserProfile, UpdateProfileData, ChangePasswordData } from '../services/userService'
export type { Device, RegisterDeviceData, UpdateDeviceData } from '../services/deviceService'

export interface ApiResponse<T> {
  status: string
  message?: string
  data: T
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
