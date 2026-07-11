import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWebsite,
  getWebsite,
  listWebsites,
  updateWebsite,
} from '../api/qrcode/website'
import type { WebsiteCreatePayload, WebsiteUpdatePayload } from '../api/qrcode/website'
import { websiteToRecord } from '../api/qrcode/website.mappers'
import { qrsQueryKey } from './useQrs'

export const websiteQueryKey = (websiteId: number) => ['website', websiteId] as const
export const websitesQueryKey = ['websites'] as const

export function useWebsite(websiteId: number | null) {
  return useQuery({
    queryKey: websiteQueryKey(websiteId ?? 0),
    enabled: websiteId != null && Number.isFinite(websiteId) && websiteId > 0,
    queryFn: () => getWebsite(websiteId as number),
    select: websiteToRecord,
  })
}

export function useWebsites() {
  return useQuery({
    queryKey: websitesQueryKey,
    queryFn: listWebsites,
    select: (websites) => websites.map(websiteToRecord),
  })
}

export function useCreateWebsite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: WebsiteCreatePayload) => createWebsite(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: websitesQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateWebsite() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      websiteId,
      payload,
    }: {
      websiteId: number
      payload: WebsiteUpdatePayload
    }) => updateWebsite(websiteId, payload),
    onSuccess: (_, { websiteId }) => {
      queryClient.invalidateQueries({ queryKey: websitesQueryKey })
      queryClient.invalidateQueries({ queryKey: websiteQueryKey(websiteId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
