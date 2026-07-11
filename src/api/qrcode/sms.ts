import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface SmsContent {
  id: number
  qr_id: number
  number: string
  message: string | null
}

export interface SmsContentPayload {
  number: string
  message?: string | null
}

export interface SmsCreatePayload extends QrCreatePayloadBase {
  content: SmsContentPayload
}

export interface SmsUpdatePayload extends QrUpdatePayloadBase {
  content?: SmsContentPayload
}

export interface SmsItem extends QrItemBase {
  content: SmsContent
}

export type SmsDetail = SmsItem
export type SmsListItem = SmsItem

export async function createSms(payload: SmsCreatePayload): Promise<SmsItem> {
  const { data } = await api.post<ApiSuccessResponse<SmsItem>>('/sms', payload)
  return data.data
}

export async function listSms(): Promise<SmsItem[]> {
  const { data } = await api.get<ApiSuccessResponse<SmsItem[]>>('/sms')
  return data.data
}

export async function getSms(smsId: number): Promise<SmsDetail> {
  const { data } = await api.get<ApiSuccessResponse<SmsDetail>>(`/sms/${smsId}`)
  return data.data
}

export async function updateSms(
  smsId: number,
  payload: SmsUpdatePayload,
): Promise<SmsItem> {
  const { data } = await api.put<ApiSuccessResponse<SmsItem>>(
    `/sms/${smsId}`,
    payload,
  )
  return data.data
}

export async function deleteSms(smsId: number): Promise<void> {
  await api.delete(`/sms/${smsId}`)
}
