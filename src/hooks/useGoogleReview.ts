import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createGoogleReview,
  getGoogleReview,
  listGoogleReviews,
  updateGoogleReview,
} from '../api/qrcode/googleReview'
import type { GoogleReviewCreatePayload, GoogleReviewUpdatePayload } from '../api/qrcode/googleReview'
import { googleReviewToRecord } from '../api/qrcode/googleReview.mappers'
import { qrsQueryKey } from './useQrs'

export const googleReviewQueryKey = (googleReviewId: number) => ['googleReview', googleReviewId] as const
export const googleReviewsQueryKey = ['googleReviews'] as const

export function useGoogleReview(googleReviewId: number | null) {
  return useQuery({
    queryKey: googleReviewQueryKey(googleReviewId ?? 0),
    enabled: googleReviewId != null && Number.isFinite(googleReviewId) && googleReviewId > 0,
    queryFn: () => getGoogleReview(googleReviewId as number),
    select: googleReviewToRecord,
  })
}

export function useGoogleReviewList() {
  return useQuery({
    queryKey: googleReviewsQueryKey,
    queryFn: listGoogleReviews,
    select: (items) => items.map(googleReviewToRecord),
  })
}

export function useCreateGoogleReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: GoogleReviewCreatePayload) => createGoogleReview(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: googleReviewsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateGoogleReview() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      googleReviewId,
      payload,
    }: {
      googleReviewId: number
      payload: GoogleReviewUpdatePayload
    }) => updateGoogleReview(googleReviewId, payload),
    onSuccess: (_, { googleReviewId }) => {
      queryClient.invalidateQueries({ queryKey: googleReviewsQueryKey })
      queryClient.invalidateQueries({ queryKey: googleReviewQueryKey(googleReviewId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
