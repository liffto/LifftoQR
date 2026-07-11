import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createVideo,
  getVideo,
  listVideos,
  updateVideo,
} from '../api/qrcode/video'
import type { VideoCreatePayload, VideoUpdatePayload } from '../api/qrcode/video'
import { videoToRecord } from '../api/qrcode/video.mappers'
import { qrsQueryKey } from './useQrs'

export const videoQueryKey = (videoId: number) => ['video', videoId] as const
export const videosQueryKey = ['videos'] as const

export function useVideo(videoId: number | null) {
  return useQuery({
    queryKey: videoQueryKey(videoId ?? 0),
    enabled: videoId != null && Number.isFinite(videoId) && videoId > 0,
    queryFn: () => getVideo(videoId as number),
    select: videoToRecord,
  })
}

export function useVideoList() {
  return useQuery({
    queryKey: videosQueryKey,
    queryFn: listVideos,
    select: (items) => items.map(videoToRecord),
  })
}

export function useCreateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: VideoCreatePayload) => createVideo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: videosQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateVideo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      videoId,
      payload,
    }: {
      videoId: number
      payload: VideoUpdatePayload
    }) => updateVideo(videoId, payload),
    onSuccess: (_, { videoId }) => {
      queryClient.invalidateQueries({ queryKey: videosQueryKey })
      queryClient.invalidateQueries({ queryKey: videoQueryKey(videoId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
