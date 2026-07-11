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

export async function deleteQr(qrId: number): Promise<void> {
  await api.delete(`/qrs/${qrId}`)
}

export function qrToRecord(item: QrListItem) {
  return itemToBaseRecord(item)
}
