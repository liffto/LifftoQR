import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface PhoneContent {
  id: number
  qr_id: number
  phone: string
}

export interface PhoneContentPayload {
  phone: string
}

export interface PhoneCreatePayload extends QrCreatePayloadBase {
  content: PhoneContentPayload
}

export interface PhoneUpdatePayload extends QrUpdatePayloadBase {
  content?: PhoneContentPayload
}

export interface PhoneItem extends QrItemBase {
  content: PhoneContent
}

export type PhoneDetail = PhoneItem
export type PhoneListItem = PhoneItem

export async function createPhone(payload: PhoneCreatePayload): Promise<PhoneItem> {
  const { data } = await api.post<ApiSuccessResponse<PhoneItem>>('/phones', payload)
  return data.data
}

export async function listPhones(): Promise<PhoneItem[]> {
  const { data } = await api.get<ApiSuccessResponse<PhoneItem[]>>('/phones')
  return data.data
}

export async function getPhone(phoneId: number): Promise<PhoneDetail> {
  const { data } = await api.get<ApiSuccessResponse<PhoneDetail>>(`/phones/${phoneId}`)
  return data.data
}

export async function updatePhone(
  phoneId: number,
  payload: PhoneUpdatePayload,
): Promise<PhoneItem> {
  const { data } = await api.put<ApiSuccessResponse<PhoneItem>>(
    `/phones/${phoneId}`,
    payload,
  )
  return data.data
}

export async function deletePhone(phoneId: number): Promise<void> {
  await api.delete(`/phones/${phoneId}`)
}
