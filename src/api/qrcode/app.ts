import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface AppContent {
  id: number
  qr_id: number
  iosUrl: string | null
  androidUrl: string | null
  fallbackUrl: string | null
  name: string
}

export interface AppContentPayload {
  iosUrl?: string | null
  androidUrl?: string | null
  fallbackUrl?: string | null
  name: string
}

export interface AppCreatePayload extends QrCreatePayloadBase {
  content: AppContentPayload
}

export interface AppUpdatePayload extends QrUpdatePayloadBase {
  content?: AppContentPayload
}

export interface AppItem extends QrItemBase {
  content: AppContent
}

export type AppDetail = AppItem
export type AppListItem = AppItem

export async function createApp(payload: AppCreatePayload): Promise<AppItem> {
  const { data } = await api.post<ApiSuccessResponse<AppItem>>('/apps', payload)
  return data.data
}

export async function listApps(): Promise<AppItem[]> {
  const { data } = await api.get<ApiSuccessResponse<AppItem[]>>('/apps')
  return data.data
}

export async function getApp(appId: number): Promise<AppDetail> {
  const { data } = await api.get<ApiSuccessResponse<AppDetail>>(`/apps/${appId}`)
  return data.data
}

export async function updateApp(
  appId: number,
  payload: AppUpdatePayload,
): Promise<AppItem> {
  const { data } = await api.put<ApiSuccessResponse<AppItem>>(
    `/apps/${appId}`,
    payload,
  )
  return data.data
}

export async function deleteApp(appId: number): Promise<void> {
  await api.delete(`/apps/${appId}`)
}
