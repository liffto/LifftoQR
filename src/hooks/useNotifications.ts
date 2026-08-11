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
    // stale badge until the next navigation. Focus matters too: the app-wide
    // default is not to refetch on focus, so coming back to the tab would
    // otherwise show whatever the badge said when you left it.
    staleTime: 0,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
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
