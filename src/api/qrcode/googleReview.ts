import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface GoogleReviewContent {
  id: number
  qr_id: number
  url: string
  businessName: string
}

export interface GoogleReviewContentPayload {
  url: string
  businessName: string
}

export interface GoogleReviewCreatePayload extends QrCreatePayloadBase {
  content: GoogleReviewContentPayload
}

export interface GoogleReviewUpdatePayload extends QrUpdatePayloadBase {
  content?: GoogleReviewContentPayload
}

export interface GoogleReviewItem extends QrItemBase {
  content: GoogleReviewContent
}

export type GoogleReviewDetail = GoogleReviewItem
export type GoogleReviewListItem = GoogleReviewItem

export async function createGoogleReview(payload: GoogleReviewCreatePayload): Promise<GoogleReviewItem> {
  const { data } = await api.post<ApiSuccessResponse<GoogleReviewItem>>('/google-reviews', payload)
  return data.data
}

export async function listGoogleReviews(): Promise<GoogleReviewItem[]> {
  const { data } = await api.get<ApiSuccessResponse<GoogleReviewItem[]>>('/google-reviews')
  return data.data
}

export async function getGoogleReview(googleReviewId: number): Promise<GoogleReviewDetail> {
  const { data } = await api.get<ApiSuccessResponse<GoogleReviewDetail>>(`/google-reviews/${googleReviewId}`)
  return data.data
}

export async function updateGoogleReview(
  googleReviewId: number,
  payload: GoogleReviewUpdatePayload,
): Promise<GoogleReviewItem> {
  const { data } = await api.put<ApiSuccessResponse<GoogleReviewItem>>(
    `/google-reviews/${googleReviewId}`,
    payload,
  )
  return data.data
}

export async function deleteGoogleReview(googleReviewId: number): Promise<void> {
  await api.delete(`/google-reviews/${googleReviewId}`)
}
