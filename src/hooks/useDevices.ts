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
