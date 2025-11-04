import { api } from './api'

export interface SkinScores {
  moisture: number
  elasticity: number
  wrinkles: number
  pores: number
  pigmentation: number
  redness: number
  acne: number
}

export interface Recommendation {
  category: string
  severity: string
  message: string
  message_en: string
  message_ja: string
}

export interface AnalysisResult {
  scores: SkinScores
  features?: any
  face_detected: boolean
  recommendations: Recommendation[]
  overall_score: number
}

export interface DiagnosisWithAnalysis {
  diagnosis: any
  analysis: AnalysisResult
}

export const aiService = {
  /**
   * Analyze skin image and save as diagnosis
   */
  async analyzeSkin(
    imageFile: File,
    deviceId: string
  ): Promise<{ status: string; message: string; data: DiagnosisWithAnalysis }> {
    const formData = new FormData()
    formData.append('image', imageFile)
    formData.append('device_id', deviceId)

    const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/analyze`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Analysis failed')
    }

    return await response.json()
  },

  /**
   * Quick scan without saving
   */
  async quickScan(imageFile: File): Promise<{ status: string; message: string; data: AnalysisResult }> {
    const formData = new FormData()
    formData.append('image', imageFile)

    const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/quick-scan`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Quick scan failed')
    }

    return await response.json()
  },

  /**
   * Check AI service health
   */
  async checkHealth(): Promise<{ status: string; message: string; data: any }> {
    return await api.get('/ai/health')
  },
}
