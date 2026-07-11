import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { VideoItem } from './video'

export function recordToVideoCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      url: record.content?.url || record.url || '',
    },
  }
}

export function recordToVideoUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToVideoCreatePayload(record)
}

export function videoToRecord(item: VideoItem) {
  return itemToBaseRecord(item)
}
