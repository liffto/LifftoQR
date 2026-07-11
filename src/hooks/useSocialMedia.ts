import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSocialMedia,
  getSocialMedia,
  listSocialMedia,
  updateSocialMedia,
} from '../api/qrcode/socialMedia'
import type { SocialMediaCreatePayload, SocialMediaUpdatePayload } from '../api/qrcode/socialMedia'
import { socialMediaToRecord } from '../api/qrcode/socialMedia.mappers'
import { qrsQueryKey } from './useQrs'

export const socialMediaQueryKey = (socialMediaId: number) => ['socialMedia', socialMediaId] as const
export const socialMediaListQueryKey = ['socialMedias'] as const

export function useSocialMedia(socialMediaId: number | null) {
  return useQuery({
    queryKey: socialMediaQueryKey(socialMediaId ?? 0),
    enabled: socialMediaId != null && Number.isFinite(socialMediaId) && socialMediaId > 0,
    queryFn: () => getSocialMedia(socialMediaId as number),
    select: socialMediaToRecord,
  })
}

export function useSocialMediaList() {
  return useQuery({
    queryKey: socialMediaListQueryKey,
    queryFn: listSocialMedia,
    select: (items) => items.map(socialMediaToRecord),
  })
}

export function useCreateSocialMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SocialMediaCreatePayload) => createSocialMedia(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: socialMediaListQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateSocialMedia() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      socialMediaId,
      payload,
    }: {
      socialMediaId: number
      payload: SocialMediaUpdatePayload
    }) => updateSocialMedia(socialMediaId, payload),
    onSuccess: (_, { socialMediaId }) => {
      queryClient.invalidateQueries({ queryKey: socialMediaListQueryKey })
      queryClient.invalidateQueries({ queryKey: socialMediaQueryKey(socialMediaId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
