import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface EventContent {
  id: number
  qr_id: number
  title: string
  location: string | null
  start: string
  end: string
  allDay: string
  description: string | null
}

export interface EventContentPayload {
  title: string
  location?: string | null
  start: string
  end: string
  all_day?: boolean
  description?: string | null
}

export interface EventCreatePayload extends QrCreatePayloadBase {
  content: EventContentPayload
}

export interface EventUpdatePayload extends QrUpdatePayloadBase {
  content?: EventContentPayload
}

export interface EventItem extends QrItemBase {
  content: EventContent
}

export type EventDetail = EventItem
export type EventListItem = EventItem

export async function createEvent(payload: EventCreatePayload): Promise<EventItem> {
  const { data } = await api.post<ApiSuccessResponse<EventItem>>('/events', payload)
  return data.data
}

export async function listEvents(): Promise<EventItem[]> {
  const { data } = await api.get<ApiSuccessResponse<EventItem[]>>('/events')
  return data.data
}

export async function getEvent(eventId: number): Promise<EventDetail> {
  const { data } = await api.get<ApiSuccessResponse<EventDetail>>(`/events/${eventId}`)
  return data.data
}

export async function updateEvent(
  eventId: number,
  payload: EventUpdatePayload,
): Promise<EventItem> {
  const { data } = await api.put<ApiSuccessResponse<EventItem>>(
    `/events/${eventId}`,
    payload,
  )
  return data.data
}

export async function deleteEvent(eventId: number): Promise<void> {
  await api.delete(`/events/${eventId}`)
}
