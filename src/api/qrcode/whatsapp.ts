import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface WhatsappContent {
  id: number
  qr_id: number
  countryCode: string
  phone: string
  message: string | null
}

export interface WhatsappContentPayload {
  country_code: string
  phone: string
  message?: string | null
}

export interface WhatsappCreatePayload extends QrCreatePayloadBase {
  content: WhatsappContentPayload
}

export interface WhatsappUpdatePayload extends QrUpdatePayloadBase {
  content?: WhatsappContentPayload
}

export interface WhatsappItem extends QrItemBase {
  content: WhatsappContent
}

export type WhatsappDetail = WhatsappItem
export type WhatsappListItem = WhatsappItem

export async function createWhatsapp(payload: WhatsappCreatePayload): Promise<WhatsappItem> {
  const { data } = await api.post<ApiSuccessResponse<WhatsappItem>>('/whatsapp', payload)
  return data.data
}

export async function listWhatsapp(): Promise<WhatsappItem[]> {
  const { data } = await api.get<ApiSuccessResponse<WhatsappItem[]>>('/whatsapp')
  return data.data
}

export async function getWhatsapp(whatsappId: number): Promise<WhatsappDetail> {
  const { data } = await api.get<ApiSuccessResponse<WhatsappDetail>>(`/whatsapp/${whatsappId}`)
  return data.data
}

export async function updateWhatsapp(
  whatsappId: number,
  payload: WhatsappUpdatePayload,
): Promise<WhatsappItem> {
  const { data } = await api.put<ApiSuccessResponse<WhatsappItem>>(
    `/whatsapp/${whatsappId}`,
    payload,
  )
  return data.data
}

export async function deleteWhatsapp(whatsappId: number): Promise<void> {
  await api.delete(`/whatsapp/${whatsappId}`)
}
