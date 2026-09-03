import { api } from '../axios'
import type { ApiSuccessResponse, QrItemBase, TemplateItem } from './types'
import { itemToBaseRecord } from './mappers.shared'

export interface QrListItem extends QrItemBase {
  content: Record<string, unknown>
  template: TemplateItem
}

export async function listQrs(): Promise<QrListItem[]> {
  const { data } = await api.get<ApiSuccessResponse<QrListItem[]>>('/qrs')
  return data.data
}

export async function getQr(qrId: number): Promise<QrListItem> {
  const { data } = await api.get<ApiSuccessResponse<QrListItem>>(`/qrs/${qrId}`)
  return data.data
}

/** When unique-scan tracking began — null if nothing has been recorded yet. */
export async function getScanTracking(): Promise<{ since: string | null }> {
  const { data } =
    await api.get<ApiSuccessResponse<{ since: string | null }>>('/qrs/scan-tracking')
  return data.data
}

export async function deleteQr(qrId: number): Promise<void> {
  await api.delete(`/qrs/${qrId}`)
}

/** Map typeKey → type-specific update path (status-only PUT). */
const STATUS_PATHS: Record<string, (id: number) => string> = {
  url: (id) => `/websites/${id}`,
  text: (id) => `/texts/${id}`,
  wifi: (id) => `/wifis/${id}`,
  vcard: (id) => `/vcards/${id}`,
  email: (id) => `/emails/${id}`,
  sms: (id) => `/sms/${id}`,
  phone: (id) => `/phones/${id}`,
  whatsapp: (id) => `/whatsapp/${id}`,
  event: (id) => `/events/${id}`,
  location: (id) => `/locations/${id}`,
  social: (id) => `/social-media/${id}`,
  'google-review': (id) => `/google-reviews/${id}`,
  pdf: (id) => `/pdfs/${id}`,
  video: (id) => `/videos/${id}`,
  mp3: (id) => `/audios/${id}`,
  app: (id) => `/apps/${id}`,
  linktree: (id) => `/link-trees/${id}`,
  coupon: (id) => `/coupons/${id}`,
  invitation: (id) => `/invitations/${id}`,
  feedback: (id) => `/feedbacks/${id}`,
}

export async function setQrStatus(
  typeKey: string,
  qrId: number,
  status: 'Active' | 'Inactive',
): Promise<void> {
  const path = STATUS_PATHS[typeKey]?.(qrId)
  if (!path) {
    throw new Error(`Cannot update status for unknown QR type: ${typeKey}`)
  }
  await api.put(path, { status: status !== 'Inactive' })
}

export function qrToRecord(item: QrListItem) {
  return itemToBaseRecord(item)
}
