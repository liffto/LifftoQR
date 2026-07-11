import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { LocationItem } from './location'

export function recordToLocationCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { lat?: number | string; lng?: number | string; label?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      lat: Number(record.content?.lat ?? 0),
      lng: Number(record.content?.lng ?? 0),
      label: record.content?.label ?? null,
    },
  }
}

export function recordToLocationUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { lat?: number | string; lng?: number | string; label?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToLocationCreatePayload(record)
}

export function locationToRecord(item: LocationItem) {
  return itemToBaseRecord(item)
}
