import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createWhatsapp,
  getWhatsapp,
  listWhatsapp,
  updateWhatsapp,
} from '../api/qrcode/whatsapp'
import type { WhatsappCreatePayload, WhatsappUpdatePayload } from '../api/qrcode/whatsapp'
import { whatsappToRecord } from '../api/qrcode/whatsapp.mappers'
import { qrsQueryKey } from './useQrs'

export const whatsappQueryKey = (whatsappId: number) => ['whatsapp', whatsappId] as const
export const whatsappListQueryKey = ['whatsapps'] as const

export function useWhatsapp(whatsappId: number | null) {
  return useQuery({
    queryKey: whatsappQueryKey(whatsappId ?? 0),
    enabled: whatsappId != null && Number.isFinite(whatsappId) && whatsappId > 0,
    queryFn: () => getWhatsapp(whatsappId as number),
    select: whatsappToRecord,
  })
}

export function useWhatsappList() {
  return useQuery({
    queryKey: whatsappListQueryKey,
    queryFn: listWhatsapp,
    select: (items) => items.map(whatsappToRecord),
  })
}

export function useCreateWhatsapp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: WhatsappCreatePayload) => createWhatsapp(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: whatsappListQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateWhatsapp() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      whatsappId,
      payload,
    }: {
      whatsappId: number
      payload: WhatsappUpdatePayload
    }) => updateWhatsapp(whatsappId, payload),
    onSuccess: (_, { whatsappId }) => {
      queryClient.invalidateQueries({ queryKey: whatsappListQueryKey })
      queryClient.invalidateQueries({ queryKey: whatsappQueryKey(whatsappId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
