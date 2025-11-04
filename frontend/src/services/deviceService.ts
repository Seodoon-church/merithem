import { api } from './api'

export interface Device {
  id: string
  serial_number: string
  model: string
  firmware_version?: string
  status: 'active' | 'inactive' | 'maintenance' | 'retired'
  nickname?: string
  last_sync_at?: string
  registered_at: string
  warranty_expires_at?: string
  created_at: string
  updated_at?: string
}

export interface RegisterDeviceData {
  serial_number: string
  model: string
  nickname?: string
}

export interface UpdateDeviceData {
  nickname?: string
  status?: 'active' | 'inactive' | 'maintenance' | 'retired'
}

export const deviceService = {
  async getDevices(): Promise<{ status: string; data: { devices: Device[]; total: number } }> {
    return await api.get('/devices')
  },

  async getDevice(id: string): Promise<{ status: string; data: { device: Device } }> {
    return await api.get(`/devices/${id}`)
  },

  async registerDevice(data: RegisterDeviceData): Promise<{ status: string; message: string; data: { device: Device } }> {
    return await api.post('/devices', data)
  },

  async updateDevice(id: string, data: UpdateDeviceData): Promise<{ status: string; message: string; data: { device: Device } }> {
    return await api.put(`/devices/${id}`, data)
  },

  async deleteDevice(id: string): Promise<{ status: string; message: string }> {
    return await api.delete(`/devices/${id}`)
  },

  async syncDevice(id: string): Promise<{ status: string; message: string; data: { device: Device } }> {
    return await api.post(`/devices/${id}/sync`)
  },
}
