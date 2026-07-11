import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createAudio,
  getAudio,
  listAudios,
  updateAudio,
} from '../api/qrcode/audio'
import type { AudioCreatePayload, AudioUpdatePayload } from '../api/qrcode/audio'
import { audioToRecord } from '../api/qrcode/audio.mappers'
import { qrsQueryKey } from './useQrs'

export const audioQueryKey = (audioId: number) => ['audio', audioId] as const
export const audiosQueryKey = ['audios'] as const

export function useAudio(audioId: number | null) {
  return useQuery({
    queryKey: audioQueryKey(audioId ?? 0),
    enabled: audioId != null && Number.isFinite(audioId) && audioId > 0,
    queryFn: () => getAudio(audioId as number),
    select: audioToRecord,
  })
}

export function useAudioList() {
  return useQuery({
    queryKey: audiosQueryKey,
    queryFn: listAudios,
    select: (items) => items.map(audioToRecord),
  })
}

export function useCreateAudio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: AudioCreatePayload) => createAudio(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: audiosQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateAudio() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      audioId,
      payload,
    }: {
      audioId: number
      payload: AudioUpdatePayload
    }) => updateAudio(audioId, payload),
    onSuccess: (_, { audioId }) => {
      queryClient.invalidateQueries({ queryKey: audiosQueryKey })
      queryClient.invalidateQueries({ queryKey: audioQueryKey(audioId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
