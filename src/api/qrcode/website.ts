import { api } from '../axios'

export interface TemplatePayload {
  logo?: string | null
  logo_size?: number
  frame_text?: string | null
  frame?: string
  body_pattern?: string
  body_gradient?: boolean
  body_color_1?: string
  body_color_2?: string
  corner_style?: number
  corner_gradient?: boolean
  corner_color_1?: string
  corner_color_2?: string
  background?: string
}

export interface TemplateItem {
  id: number
  qr_id: number
  logo: string | null
  logoSize: number
  frame: string
  frameText: string | null
  bodyPattern: string
  bodyGradient: boolean
  bodyColor1: string
  bodyColor2: string
  cornerStyle: number
  cornerGradient: boolean
  cornerColor1: string
  cornerColor2: string
  background: string
}

export interface WebsiteContent {
  id: number
  qr_id: number
  url: string
}

export interface WebsiteContentPayload {
  url: string
}

export interface WebsiteCreatePayload {
  name: string
  url: string
  slug: string
  dynamic?: boolean
  qr_type: string
  folder?: string | null
  status?: boolean
  scans?: number
  content: WebsiteContentPayload
  template: TemplatePayload
}

export interface WebsiteUpdatePayload {
  name?: string
  url?: string
  slug?: string
  dynamic?: boolean
  qr_type?: string
  folder?: string | null
  status?: boolean
  scans?: number
  content?: WebsiteContentPayload
  template?: TemplatePayload
}

export interface WebsiteItem {
  id: number
  typeKey: string
  type: string
  name: string
  url: string | null
  slug: string
  dynamic: boolean
  qrType: string
  folder: string | null
  status: string
  scans: number
  editedOn: string | null
  content: WebsiteContent
  template: TemplateItem
}

export type WebsiteDetail = WebsiteItem
export type WebsiteListItem = WebsiteItem

interface ApiSuccessResponse<T> {
  success: boolean
  data: T
}

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
