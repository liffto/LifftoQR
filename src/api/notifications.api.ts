import { api } from './axios'
import type { ApiUserResponse } from '../types/auth'

export interface Notification {
  id: number
  kind: string
  title: string
  body: string
  qr_id: number | null
  read: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPrefs {
  notify_scans: boolean
  notify_weekly: boolean
  notify_product: boolean
}

export async function listNotifications(): Promise<Notification[]> {
  const { data } = await api.get<Notification[]>('/auth/me/notifications')
  return data
}

export async function markNotificationRead(id: number): Promise<void> {
  await api.post(`/auth/me/notifications/${id}/read`)
}

export async function markAllNotificationsRead(): Promise<void> {
  await api.post('/auth/me/notifications/read-all')
}

export async function updateNotificationPrefs(
  prefs: NotificationPrefs,
): Promise<ApiUserResponse> {
  const { data } = await api.patch<ApiUserResponse>(
    '/auth/me/notification-preferences',
    prefs,
  )
  return data
}
