import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createApp,
  getApp,
  listApps,
  updateApp,
} from '../api/qrcode/app'
import type { AppCreatePayload, AppUpdatePayload } from '../api/qrcode/app'
import { appToRecord } from '../api/qrcode/app.mappers'
import { qrsQueryKey } from './useQrs'

export const appQueryKey = (appId: number) => ['app', appId] as const
export const appsQueryKey = ['apps'] as const

export function useApp(appId: number | null) {
  return useQuery({
    queryKey: appQueryKey(appId ?? 0),
    enabled: appId != null && Number.isFinite(appId) && appId > 0,
    queryFn: () => getApp(appId as number),
    select: appToRecord,
  })
}

export function useAppList() {
  return useQuery({
    queryKey: appsQueryKey,
    queryFn: listApps,
    select: (items) => items.map(appToRecord),
  })
}

export function useCreateApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AppCreatePayload) => createApp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateApp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      appId,
      payload,
    }: {
      appId: number
      payload: AppUpdatePayload
    }) => updateApp(appId, payload),
    onSuccess: (_, { appId }) => {
      queryClient.invalidateQueries({ queryKey: appsQueryKey })
      queryClient.invalidateQueries({ queryKey: appQueryKey(appId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
