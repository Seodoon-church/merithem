import { api } from './api'

export interface Diagnosis {
  id: string
  user_id: string
  device_id?: string
  diagnosis_date: string
  image_url?: string
  ai_model_version?: string
  overall_score?: number
  moisture_level?: number
  elasticity_level?: number
  wrinkle_severity?: number
  pore_size?: number
  pigmentation_level?: number
  redness_level?: number
  acne_severity?: number
  skin_tone?: string
  detected_issues?: string[]
  recommendations?: any
  notes?: string
  device_serial_number?: string
  device_model?: string
  device_nickname?: string
}

export interface CreateDiagnosisData {
  device_id?: string
  image_url?: string
  overall_score?: number
  moisture_level?: number
  elasticity_level?: number
  wrinkle_severity?: number
  pore_size?: number
  pigmentation_level?: number
  redness_level?: number
  acne_severity?: number
  skin_tone?: string
  detected_issues?: string[]
  recommendations?: any
  notes?: string
}

export interface DiagnosisStats {
  averageScores: Array<{
    date: string
    avg_overall_score: number
    avg_moisture: number
    avg_elasticity: number
    avg_wrinkles: number
  }>
  latestDiagnosis: Diagnosis | null
}

export const diagnosisService = {
  async getDiagnoses(
    limit = 10,
    offset = 0
  ): Promise<{ status: string; data: { diagnoses: Diagnosis[]; total: number; limit: number; offset: number } }> {
    return await api.get(`/diagnoses?limit=${limit}&offset=${offset}`)
  },

  async getDiagnosis(id: string): Promise<{ status: string; data: { diagnosis: Diagnosis } }> {
    return await api.get(`/diagnoses/${id}`)
  },

  async createDiagnosis(
    data: CreateDiagnosisData
  ): Promise<{ status: string; message: string; data: { diagnosis: Diagnosis } }> {
    return await api.post('/diagnoses', data)
  },

  async deleteDiagnosis(id: string): Promise<{ status: string; message: string }> {
    return await api.delete(`/diagnoses/${id}`)
  },

  async getStats(): Promise<{ status: string; data: DiagnosisStats }> {
    return await api.get('/diagnoses/stats')
  },
}
