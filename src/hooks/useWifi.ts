import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWifi,
  getWifi,
  listWifis,
  updateWifi,
} from '../api/qrcode/wifi'
import type { WifiCreatePayload, WifiUpdatePayload } from '../api/qrcode/wifi'
import { wifiToRecord } from '../api/qrcode/wifi.mappers'
import { qrsQueryKey } from './useQrs'

export const wifiQueryKey = (wifiId: number) => ['wifi', wifiId] as const
export const wifisQueryKey = ['wifis'] as const

export function useWifi(wifiId: number | null) {
  return useQuery({
    queryKey: wifiQueryKey(wifiId ?? 0),
    enabled: wifiId != null && Number.isFinite(wifiId) && wifiId > 0,
    queryFn: () => getWifi(wifiId as number),
    select: wifiToRecord,
  })
}

export function useWifiList() {
  return useQuery({
    queryKey: wifisQueryKey,
    queryFn: listWifis,
    select: (items) => items.map(wifiToRecord),
  })
}

export function useCreateWifi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: WifiCreatePayload) => createWifi(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: wifisQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateWifi() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      wifiId,
      payload,
    }: {
      wifiId: number
      payload: WifiUpdatePayload
    }) => updateWifi(wifiId, payload),
    onSuccess: (_, { wifiId }) => {
      queryClient.invalidateQueries({ queryKey: wifisQueryKey })
      queryClient.invalidateQueries({ queryKey: wifiQueryKey(wifiId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
