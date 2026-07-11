import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createFeedback,
  getFeedback,
  listFeedbacks,
  updateFeedback,
} from '../api/qrcode/feedback'
import type { FeedbackCreatePayload, FeedbackUpdatePayload } from '../api/qrcode/feedback'
import { feedbackToRecord } from '../api/qrcode/feedback.mappers'
import { qrsQueryKey } from './useQrs'

export const feedbackQueryKey = (feedbackId: number) => ['feedback', feedbackId] as const
export const feedbacksQueryKey = ['feedbacks'] as const

export function useFeedback(feedbackId: number | null) {
  return useQuery({
    queryKey: feedbackQueryKey(feedbackId ?? 0),
    enabled: feedbackId != null && Number.isFinite(feedbackId) && feedbackId > 0,
    queryFn: () => getFeedback(feedbackId as number),
    select: feedbackToRecord,
  })
}

export function useFeedbackList() {
  return useQuery({
    queryKey: feedbacksQueryKey,
    queryFn: listFeedbacks,
    select: (items) => items.map(feedbackToRecord),
  })
}

export function useCreateFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: FeedbackCreatePayload) => createFeedback(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: feedbacksQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateFeedback() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      feedbackId,
      payload,
    }: {
      feedbackId: number
      payload: FeedbackUpdatePayload
    }) => updateFeedback(feedbackId, payload),
    onSuccess: (_, { feedbackId }) => {
      queryClient.invalidateQueries({ queryKey: feedbacksQueryKey })
      queryClient.invalidateQueries({ queryKey: feedbackQueryKey(feedbackId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
