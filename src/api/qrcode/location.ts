import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface LocationContent {
  id: number
  qr_id: number
  lat: number
  lng: number
  label: string | null
}

export interface LocationContentPayload {
  lat: number
  lng: number
  label?: string | null
}

export interface LocationCreatePayload extends QrCreatePayloadBase {
  content: LocationContentPayload
}

export interface LocationUpdatePayload extends QrUpdatePayloadBase {
  content?: LocationContentPayload
}

export interface LocationItem extends QrItemBase {
  content: LocationContent
}

export type LocationDetail = LocationItem
export type LocationListItem = LocationItem

export async function createLocation(payload: LocationCreatePayload): Promise<LocationItem> {
  const { data } = await api.post<ApiSuccessResponse<LocationItem>>('/locations', payload)
  return data.data
}

export async function listLocations(): Promise<LocationItem[]> {
  const { data } = await api.get<ApiSuccessResponse<LocationItem[]>>('/locations')
  return data.data
}

export async function getLocation(locationId: number): Promise<LocationDetail> {
  const { data } = await api.get<ApiSuccessResponse<LocationDetail>>(`/locations/${locationId}`)
  return data.data
}

export async function updateLocation(
  locationId: number,
  payload: LocationUpdatePayload,
): Promise<LocationItem> {
  const { data } = await api.put<ApiSuccessResponse<LocationItem>>(
    `/locations/${locationId}`,
    payload,
  )
  return data.data
}

export async function deleteLocation(locationId: number): Promise<void> {
  await api.delete(`/locations/${locationId}`)
}
