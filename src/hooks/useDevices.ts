import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  listDevices,
  signOutDevice,
  signOutOtherDevices,
} from '../api/devices.api'

export const devicesQueryKey = ['devices'] as const

export function useDevices() {
  return useQuery({
    queryKey: devicesQueryKey,
    queryFn: listDevices,
    // "What is signed into my account?" has to be answered with current data.
    // The app-wide defaults hold every query fresh for a minute and never
    // refetch on focus — sensible for QR codes, but it left this list showing
    // a device that had just signed in elsewhere only after a hard refresh.
    staleTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchInterval: 30_000,
  })
}

export function useSignOutDevice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (deviceId: number) => signOutDevice(deviceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devicesQueryKey })
    },
  })
}

export function useSignOutOtherDevices() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: signOutOtherDevices,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: devicesQueryKey })
    },
  })
}
