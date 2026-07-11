import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface SocialMediaContent {
  id: number
  qr_id: number
  platform: string
  handle: string | null
  url: string | null
}

export interface SocialMediaContentPayload {
  platform: string
  handle?: string | null
  url?: string | null
}

export interface SocialMediaCreatePayload extends QrCreatePayloadBase {
  content: SocialMediaContentPayload
}

export interface SocialMediaUpdatePayload extends QrUpdatePayloadBase {
  content?: SocialMediaContentPayload
}

export interface SocialMediaItem extends QrItemBase {
  content: SocialMediaContent
}

export type SocialMediaDetail = SocialMediaItem
export type SocialMediaListItem = SocialMediaItem

export async function createSocialMedia(payload: SocialMediaCreatePayload): Promise<SocialMediaItem> {
  const { data } = await api.post<ApiSuccessResponse<SocialMediaItem>>('/social-media', payload)
  return data.data
}

export async function listSocialMedia(): Promise<SocialMediaItem[]> {
  const { data } = await api.get<ApiSuccessResponse<SocialMediaItem[]>>('/social-media')
  return data.data
}

export async function getSocialMedia(socialMediaId: number): Promise<SocialMediaDetail> {
  const { data } = await api.get<ApiSuccessResponse<SocialMediaDetail>>(`/social-media/${socialMediaId}`)
  return data.data
}

export async function updateSocialMedia(
  socialMediaId: number,
  payload: SocialMediaUpdatePayload,
): Promise<SocialMediaItem> {
  const { data } = await api.put<ApiSuccessResponse<SocialMediaItem>>(
    `/social-media/${socialMediaId}`,
    payload,
  )
  return data.data
}

export async function deleteSocialMedia(socialMediaId: number): Promise<void> {
  await api.delete(`/social-media/${socialMediaId}`)
}
