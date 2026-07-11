import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface TextContent {
  id: number
  qr_id: number
  text: string
}

export interface TextContentPayload {
  text: string
}

export interface TextCreatePayload extends QrCreatePayloadBase {
  content: TextContentPayload
}

export interface TextUpdatePayload extends QrUpdatePayloadBase {
  content?: TextContentPayload
}

export interface TextItem extends QrItemBase {
  content: TextContent
}

export type TextDetail = TextItem
export type TextListItem = TextItem

export async function createText(payload: TextCreatePayload): Promise<TextItem> {
  const { data } = await api.post<ApiSuccessResponse<TextItem>>('/texts', payload)
  return data.data
}

export async function listTexts(): Promise<TextItem[]> {
  const { data } = await api.get<ApiSuccessResponse<TextItem[]>>('/texts')
  return data.data
}

export async function getText(textId: number): Promise<TextDetail> {
  const { data } = await api.get<ApiSuccessResponse<TextDetail>>(`/texts/${textId}`)
  return data.data
}

export async function updateText(
  textId: number,
  payload: TextUpdatePayload,
): Promise<TextItem> {
  const { data } = await api.put<ApiSuccessResponse<TextItem>>(
    `/texts/${textId}`,
    payload,
  )
  return data.data
}

export async function deleteText(textId: number): Promise<void> {
  await api.delete(`/texts/${textId}`)
}
