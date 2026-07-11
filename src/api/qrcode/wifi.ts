import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface WifiContent {
  id: number
  qr_id: number
  ssid: string
  auth: string
  hidden: boolean
  password: string | null
}

export interface WifiContentPayload {
  ssid: string
  auth: string
  hidden?: boolean
  password?: string | null
}

export interface WifiCreatePayload extends QrCreatePayloadBase {
  content: WifiContentPayload
}

export interface WifiUpdatePayload extends QrUpdatePayloadBase {
  content?: WifiContentPayload
}

export interface WifiItem extends QrItemBase {
  content: WifiContent
}

export type WifiDetail = WifiItem
export type WifiListItem = WifiItem

export async function createWifi(payload: WifiCreatePayload): Promise<WifiItem> {
  const { data } = await api.post<ApiSuccessResponse<WifiItem>>('/wifis', payload)
  return data.data
}

export async function listWifis(): Promise<WifiItem[]> {
  const { data } = await api.get<ApiSuccessResponse<WifiItem[]>>('/wifis')
  return data.data
}

export async function getWifi(wifiId: number): Promise<WifiDetail> {
  const { data } = await api.get<ApiSuccessResponse<WifiDetail>>(`/wifis/${wifiId}`)
  return data.data
}

export async function updateWifi(
  wifiId: number,
  payload: WifiUpdatePayload,
): Promise<WifiItem> {
  const { data } = await api.put<ApiSuccessResponse<WifiItem>>(
    `/wifis/${wifiId}`,
    payload,
  )
  return data.data
}

export async function deleteWifi(wifiId: number): Promise<void> {
  await api.delete(`/wifis/${wifiId}`)
}
