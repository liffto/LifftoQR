import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createEvent,
  getEvent,
  listEvents,
  updateEvent,
} from '../api/qrcode/event'
import type { EventCreatePayload, EventUpdatePayload } from '../api/qrcode/event'
import { eventToRecord } from '../api/qrcode/event.mappers'
import { qrsQueryKey } from './useQrs'

export const eventQueryKey = (eventId: number) => ['event', eventId] as const
export const eventsQueryKey = ['events'] as const

export function useEvent(eventId: number | null) {
  return useQuery({
    queryKey: eventQueryKey(eventId ?? 0),
    enabled: eventId != null && Number.isFinite(eventId) && eventId > 0,
    queryFn: () => getEvent(eventId as number),
    select: eventToRecord,
  })
}

export function useEventList() {
  return useQuery({
    queryKey: eventsQueryKey,
    queryFn: listEvents,
    select: (items) => items.map(eventToRecord),
  })
}

export function useCreateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: EventCreatePayload) => createEvent(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateEvent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      eventId,
      payload,
    }: {
      eventId: number
      payload: EventUpdatePayload
    }) => updateEvent(eventId, payload),
    onSuccess: (_, { eventId }) => {
      queryClient.invalidateQueries({ queryKey: eventsQueryKey })
      queryClient.invalidateQueries({ queryKey: eventQueryKey(eventId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
