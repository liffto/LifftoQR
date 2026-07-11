import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface AudioContent {
  id: number
  qr_id: number
  url: string
  title: string | null
}

export interface AudioContentPayload {
  url: string
  title?: string | null
}

export interface AudioCreatePayload extends QrCreatePayloadBase {
  content: AudioContentPayload
}

export interface AudioUpdatePayload extends QrUpdatePayloadBase {
  content?: AudioContentPayload
}

export interface AudioItem extends QrItemBase {
  content: AudioContent
}

export type AudioDetail = AudioItem
export type AudioListItem = AudioItem

export async function createAudio(payload: AudioCreatePayload): Promise<AudioItem> {
  const { data } = await api.post<ApiSuccessResponse<AudioItem>>('/audios', payload)
  return data.data
}

export async function listAudios(): Promise<AudioItem[]> {
  const { data } = await api.get<ApiSuccessResponse<AudioItem[]>>('/audios')
  return data.data
}

export async function getAudio(audioId: number): Promise<AudioDetail> {
  const { data } = await api.get<ApiSuccessResponse<AudioDetail>>(`/audios/${audioId}`)
  return data.data
}

export async function updateAudio(
  audioId: number,
  payload: AudioUpdatePayload,
): Promise<AudioItem> {
  const { data } = await api.put<ApiSuccessResponse<AudioItem>>(
    `/audios/${audioId}`,
    payload,
  )
  return data.data
}

export async function deleteAudio(audioId: number): Promise<void> {
  await api.delete(`/audios/${audioId}`)
}
