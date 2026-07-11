import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { EventItem } from './event'

export function recordToEventCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; location?: string | null; start?: string; end?: string; allDay?: boolean | string; all_day?: boolean; description?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      title: record.content?.title || '',
      location: record.content?.location ?? null,
      start: record.content?.start || '',
      end: record.content?.end || '',
      all_day: Boolean(record.content?.allDay === true || record.content?.all_day === true || record.content?.allDay === 'Yes'),
      description: record.content?.description ?? null,
    },
  }
}

export function recordToEventUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; location?: string | null; start?: string; end?: string; allDay?: boolean | string; all_day?: boolean; description?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToEventCreatePayload(record)
}

export function eventToRecord(item: EventItem) {
  return itemToBaseRecord(item)
}
