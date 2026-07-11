import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface VideoContent {
  id: number
  qr_id: number
  url: string
}

export interface VideoContentPayload {
  url: string
}

export interface VideoCreatePayload extends QrCreatePayloadBase {
  content: VideoContentPayload
}

export interface VideoUpdatePayload extends QrUpdatePayloadBase {
  content?: VideoContentPayload
}

export interface VideoItem extends QrItemBase {
  content: VideoContent
}

export type VideoDetail = VideoItem
export type VideoListItem = VideoItem

export async function createVideo(payload: VideoCreatePayload): Promise<VideoItem> {
  const { data } = await api.post<ApiSuccessResponse<VideoItem>>('/videos', payload)
  return data.data
}

export async function listVideos(): Promise<VideoItem[]> {
  const { data } = await api.get<ApiSuccessResponse<VideoItem[]>>('/videos')
  return data.data
}

export async function getVideo(videoId: number): Promise<VideoDetail> {
  const { data } = await api.get<ApiSuccessResponse<VideoDetail>>(`/videos/${videoId}`)
  return data.data
}

export async function updateVideo(
  videoId: number,
  payload: VideoUpdatePayload,
): Promise<VideoItem> {
  const { data } = await api.put<ApiSuccessResponse<VideoItem>>(
    `/videos/${videoId}`,
    payload,
  )
  return data.data
}

export async function deleteVideo(videoId: number): Promise<void> {
  await api.delete(`/videos/${videoId}`)
}
