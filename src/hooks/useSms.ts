import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createSms,
  getSms,
  listSms,
  updateSms,
} from '../api/qrcode/sms'
import type { SmsCreatePayload, SmsUpdatePayload } from '../api/qrcode/sms'
import { smsToRecord } from '../api/qrcode/sms.mappers'
import { qrsQueryKey } from './useQrs'

export const smsQueryKey = (smsId: number) => ['sms', smsId] as const
export const smsListQueryKey = ['smss'] as const

export function useSms(smsId: number | null) {
  return useQuery({
    queryKey: smsQueryKey(smsId ?? 0),
    enabled: smsId != null && Number.isFinite(smsId) && smsId > 0,
    queryFn: () => getSms(smsId as number),
    select: smsToRecord,
  })
}

export function useSmsList() {
  return useQuery({
    queryKey: smsListQueryKey,
    queryFn: listSms,
    select: (items) => items.map(smsToRecord),
  })
}

export function useCreateSms() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: SmsCreatePayload) => createSms(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: smsListQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateSms() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      smsId,
      payload,
    }: {
      smsId: number
      payload: SmsUpdatePayload
    }) => updateSms(smsId, payload),
    onSuccess: (_, { smsId }) => {
      queryClient.invalidateQueries({ queryKey: smsListQueryKey })
      queryClient.invalidateQueries({ queryKey: smsQueryKey(smsId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
