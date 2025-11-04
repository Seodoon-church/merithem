import { api } from './api'
import { Device } from './deviceService'

export interface DashboardStats {
  deviceCount: number
  diagnosisCount: number
  subscription: {
    id: string
    plan_type: string
    status: string
    next_billing_date: string
  } | null
}

export interface RecentDiagnosis {
  id: string
  diagnosis_date: string
  overall_score: number
  image_url?: string
}

export interface DashboardData {
  stats: DashboardStats
  recentDiagnoses: RecentDiagnosis[]
  recentDevices: Device[]
}

export const dashboardService = {
  async getStats(): Promise<{ status: string; data: DashboardData }> {
    return await api.get('/dashboard/stats')
  },
}
