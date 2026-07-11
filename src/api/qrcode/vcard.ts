import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface VcardContent {
  id: number
  qr_id: number
  photo: string | null
  logo: string | null
  firstName: string
  lastName: string | null
  org: string | null
  title: string | null
  phone: string | null
  workPhone: string | null
  email: string | null
  url: string | null
  street: string | null
  city: string | null
  state: string | null
  zip: string | null
  country: string | null
  note: string | null
}

export interface VcardContentPayload {
  photo?: string | null
  logo?: string | null
  first_name: string
  last_name?: string | null
  org?: string | null
  title?: string | null
  phone?: string | null
  work_phone?: string | null
  email?: string | null
  url?: string | null
  street?: string | null
  city?: string | null
  state?: string | null
  zip?: string | null
  country?: string | null
  note?: string | null
}

export interface VcardCreatePayload extends QrCreatePayloadBase {
  content: VcardContentPayload
}

export interface VcardUpdatePayload extends QrUpdatePayloadBase {
  content?: VcardContentPayload
}

export interface VcardItem extends QrItemBase {
  content: VcardContent
}

export type VcardDetail = VcardItem
export type VcardListItem = VcardItem

export async function createVcard(payload: VcardCreatePayload): Promise<VcardItem> {
  const { data } = await api.post<ApiSuccessResponse<VcardItem>>('/vcards', payload)
  return data.data
}

export async function listVcards(): Promise<VcardItem[]> {
  const { data } = await api.get<ApiSuccessResponse<VcardItem[]>>('/vcards')
  return data.data
}

export async function getVcard(vcardId: number): Promise<VcardDetail> {
  const { data } = await api.get<ApiSuccessResponse<VcardDetail>>(`/vcards/${vcardId}`)
  return data.data
}

export async function updateVcard(
  vcardId: number,
  payload: VcardUpdatePayload,
): Promise<VcardItem> {
  const { data } = await api.put<ApiSuccessResponse<VcardItem>>(
    `/vcards/${vcardId}`,
    payload,
  )
  return data.data
}

export async function deleteVcard(vcardId: number): Promise<void> {
  await api.delete(`/vcards/${vcardId}`)
}
