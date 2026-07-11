import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createLocation,
  getLocation,
  listLocations,
  updateLocation,
} from '../api/qrcode/location'
import type { LocationCreatePayload, LocationUpdatePayload } from '../api/qrcode/location'
import { locationToRecord } from '../api/qrcode/location.mappers'
import { qrsQueryKey } from './useQrs'

export const locationQueryKey = (locationId: number) => ['location', locationId] as const
export const locationsQueryKey = ['locations'] as const

export function useLocation(locationId: number | null) {
  return useQuery({
    queryKey: locationQueryKey(locationId ?? 0),
    enabled: locationId != null && Number.isFinite(locationId) && locationId > 0,
    queryFn: () => getLocation(locationId as number),
    select: locationToRecord,
  })
}

export function useLocationList() {
  return useQuery({
    queryKey: locationsQueryKey,
    queryFn: listLocations,
    select: (items) => items.map(locationToRecord),
  })
}

export function useCreateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: LocationCreatePayload) => createLocation(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: locationsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateLocation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      locationId,
      payload,
    }: {
      locationId: number
      payload: LocationUpdatePayload
    }) => updateLocation(locationId, payload),
    onSuccess: (_, { locationId }) => {
      queryClient.invalidateQueries({ queryKey: locationsQueryKey })
      queryClient.invalidateQueries({ queryKey: locationQueryKey(locationId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
