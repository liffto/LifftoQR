import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVcard,
  getVcard,
  listVcards,
  updateVcard,
} from '../api/qrcode/vcard'
import type { VcardCreatePayload, VcardUpdatePayload } from '../api/qrcode/vcard'
import { vcardToRecord } from '../api/qrcode/vcard.mappers'
import { qrsQueryKey } from './useQrs'

export const vcardQueryKey = (vcardId: number) => ['vcard', vcardId] as const
export const vcardsQueryKey = ['vcards'] as const

export function useVcard(vcardId: number | null) {
  return useQuery({
    queryKey: vcardQueryKey(vcardId ?? 0),
    enabled: vcardId != null && Number.isFinite(vcardId) && vcardId > 0,
    queryFn: () => getVcard(vcardId as number),
    select: vcardToRecord,
  })
}

export function useVcardList() {
  return useQuery({
    queryKey: vcardsQueryKey,
    queryFn: listVcards,
    select: (items) => items.map(vcardToRecord),
  })
}

export function useCreateVcard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VcardCreatePayload) => createVcard(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vcardsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateVcard() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      vcardId,
      payload,
    }: {
      vcardId: number
      payload: VcardUpdatePayload
    }) => updateVcard(vcardId, payload),
    onSuccess: (_, { vcardId }) => {
      queryClient.invalidateQueries({ queryKey: vcardsQueryKey })
      queryClient.invalidateQueries({ queryKey: vcardQueryKey(vcardId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
