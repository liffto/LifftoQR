import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from '../api/notifications.api'

export const notificationsQueryKey = ['notifications'] as const

export function useNotifications() {
  return useQuery({
    queryKey: notificationsQueryKey,
    queryFn: listNotifications,
    // Scans arrive while the tab sits open, so poll rather than leaving a
    // stale badge until the next navigation.
    refetchInterval: 60_000,
  })
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: number) => markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationsQueryKey })
    },
  })
}
