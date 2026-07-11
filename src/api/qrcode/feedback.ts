import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface FeedbackContent {
  id: number
  qr_id: number
  url: string
  prefillKey: string | null
  prefillValue: string | null
}

export interface FeedbackContentPayload {
  url: string
  prefillKey?: string | null
  prefillValue?: string | null
}

export interface FeedbackCreatePayload extends QrCreatePayloadBase {
  content: FeedbackContentPayload
}

export interface FeedbackUpdatePayload extends QrUpdatePayloadBase {
  content?: FeedbackContentPayload
}

export interface FeedbackItem extends QrItemBase {
  content: FeedbackContent
}

export type FeedbackDetail = FeedbackItem
export type FeedbackListItem = FeedbackItem

export async function createFeedback(payload: FeedbackCreatePayload): Promise<FeedbackItem> {
  const { data } = await api.post<ApiSuccessResponse<FeedbackItem>>('/feedbacks', payload)
  return data.data
}

export async function listFeedbacks(): Promise<FeedbackItem[]> {
  const { data } = await api.get<ApiSuccessResponse<FeedbackItem[]>>('/feedbacks')
  return data.data
}

export async function getFeedback(feedbackId: number): Promise<FeedbackDetail> {
  const { data } = await api.get<ApiSuccessResponse<FeedbackDetail>>(`/feedbacks/${feedbackId}`)
  return data.data
}

export async function updateFeedback(
  feedbackId: number,
  payload: FeedbackUpdatePayload,
): Promise<FeedbackItem> {
  const { data } = await api.put<ApiSuccessResponse<FeedbackItem>>(
    `/feedbacks/${feedbackId}`,
    payload,
  )
  return data.data
}

export async function deleteFeedback(feedbackId: number): Promise<void> {
  await api.delete(`/feedbacks/${feedbackId}`)
}
