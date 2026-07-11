import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
  TemplateItem,
  TemplatePayload,
} from './types'

export type { TemplateItem, TemplatePayload }

export interface WebsiteContent {
  id: number
  qr_id: number
  url: string
}

export interface WebsiteContentPayload {
  url: string
}

export interface WebsiteCreatePayload extends QrCreatePayloadBase {
  url: string
  content: WebsiteContentPayload
}

export interface WebsiteUpdatePayload extends QrUpdatePayloadBase {
  content?: WebsiteContentPayload
}

export interface WebsiteItem extends QrItemBase {
  content: WebsiteContent
}

export type WebsiteDetail = WebsiteItem
export type WebsiteListItem = WebsiteItem

export async function createWebsite(payload: WebsiteCreatePayload): Promise<WebsiteItem> {
  const { data } = await api.post<ApiSuccessResponse<WebsiteItem>>('/websites', payload)
  return data.data
}

export async function listWebsites(): Promise<WebsiteItem[]> {
  const { data } = await api.get<ApiSuccessResponse<WebsiteItem[]>>('/websites')
  return data.data
}

export async function getWebsite(websiteId: number): Promise<WebsiteDetail> {
  const { data } = await api.get<ApiSuccessResponse<WebsiteDetail>>(`/websites/${websiteId}`)
  return data.data
}

export async function updateWebsite(
  websiteId: number,
  payload: WebsiteUpdatePayload,
): Promise<WebsiteItem> {
  const { data } = await api.put<ApiSuccessResponse<WebsiteItem>>(
    `/websites/${websiteId}`,
    payload,
  )
  return data.data
}

export async function deleteWebsite(websiteId: number): Promise<void> {
  await api.delete(`/websites/${websiteId}`)
}
