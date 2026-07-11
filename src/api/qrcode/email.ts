import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface EmailContent {
  id: number
  qr_id: number
  to: string
  subject: string | null
  body: string | null
}

export interface EmailContentPayload {
  to: string
  subject?: string | null
  body?: string | null
}

export interface EmailCreatePayload extends QrCreatePayloadBase {
  content: EmailContentPayload
}

export interface EmailUpdatePayload extends QrUpdatePayloadBase {
  content?: EmailContentPayload
}

export interface EmailItem extends QrItemBase {
  content: EmailContent
}

export type EmailDetail = EmailItem
export type EmailListItem = EmailItem

export async function createEmail(payload: EmailCreatePayload): Promise<EmailItem> {
  const { data } = await api.post<ApiSuccessResponse<EmailItem>>('/emails', payload)
  return data.data
}

export async function listEmails(): Promise<EmailItem[]> {
  const { data } = await api.get<ApiSuccessResponse<EmailItem[]>>('/emails')
  return data.data
}

export async function getEmail(emailId: number): Promise<EmailDetail> {
  const { data } = await api.get<ApiSuccessResponse<EmailDetail>>(`/emails/${emailId}`)
  return data.data
}

export async function updateEmail(
  emailId: number,
  payload: EmailUpdatePayload,
): Promise<EmailItem> {
  const { data } = await api.put<ApiSuccessResponse<EmailItem>>(
    `/emails/${emailId}`,
    payload,
  )
  return data.data
}

export async function deleteEmail(emailId: number): Promise<void> {
  await api.delete(`/emails/${emailId}`)
}
