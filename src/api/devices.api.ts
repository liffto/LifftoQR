import { api } from './axios'

export interface Device {
  id: number
  device_type: 'desktop' | 'mobile' | 'tablet'
  device_name: string
  browser: string | null
  ip_address: string | null
  last_seen_at: string
  created_at: string
  current: boolean
}

export async function listDevices(): Promise<Device[]> {
  const { data } = await api.get<Device[]>('/auth/me/devices')
  return data
}

export async function signOutDevice(deviceId: number): Promise<void> {
  await api.delete(`/auth/me/devices/${deviceId}`)
}

export async function signOutOtherDevices(): Promise<number> {
  const { data } = await api.post<{ revoked: number }>(
    '/auth/me/devices/revoke-others',
  )
  return data.revoked
}
