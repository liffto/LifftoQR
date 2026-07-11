import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPhone,
  getPhone,
  listPhones,
  updatePhone,
} from '../api/qrcode/phone'
import type { PhoneCreatePayload, PhoneUpdatePayload } from '../api/qrcode/phone'
import { phoneToRecord } from '../api/qrcode/phone.mappers'
import { qrsQueryKey } from './useQrs'

export const phoneQueryKey = (phoneId: number) => ['phone', phoneId] as const
export const phonesQueryKey = ['phones'] as const

export function usePhone(phoneId: number | null) {
  return useQuery({
    queryKey: phoneQueryKey(phoneId ?? 0),
    enabled: phoneId != null && Number.isFinite(phoneId) && phoneId > 0,
    queryFn: () => getPhone(phoneId as number),
    select: phoneToRecord,
  })
}

export function usePhoneList() {
  return useQuery({
    queryKey: phonesQueryKey,
    queryFn: listPhones,
    select: (items) => items.map(phoneToRecord),
  })
}

export function useCreatePhone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PhoneCreatePayload) => createPhone(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: phonesQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdatePhone() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      phoneId,
      payload,
    }: {
      phoneId: number
      payload: PhoneUpdatePayload
    }) => updatePhone(phoneId, payload),
    onSuccess: (_, { phoneId }) => {
      queryClient.invalidateQueries({ queryKey: phonesQueryKey })
      queryClient.invalidateQueries({ queryKey: phoneQueryKey(phoneId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
