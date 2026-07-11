import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createText,
  getText,
  listTexts,
  updateText,
} from '../api/qrcode/text'
import type { TextCreatePayload, TextUpdatePayload } from '../api/qrcode/text'
import { textToRecord } from '../api/qrcode/text.mappers'
import { qrsQueryKey } from './useQrs'

export const textQueryKey = (textId: number) => ['text', textId] as const
export const textsQueryKey = ['texts'] as const

export function useText(textId: number | null) {
  return useQuery({
    queryKey: textQueryKey(textId ?? 0),
    enabled: textId != null && Number.isFinite(textId) && textId > 0,
    queryFn: () => getText(textId as number),
    select: textToRecord,
  })
}

export function useTexts() {
  return useQuery({
    queryKey: textsQueryKey,
    queryFn: listTexts,
    select: (texts) => texts.map(textToRecord),
  })
}

export function useCreateText() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: TextCreatePayload) => createText(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: textsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateText() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      textId,
      payload,
    }: {
      textId: number
      payload: TextUpdatePayload
    }) => updateText(textId, payload),
    onSuccess: (_, { textId }) => {
      queryClient.invalidateQueries({ queryKey: textsQueryKey })
      queryClient.invalidateQueries({ queryKey: textQueryKey(textId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
