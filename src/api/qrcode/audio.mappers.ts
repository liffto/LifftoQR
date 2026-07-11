import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { AudioItem } from './audio'

export function recordToAudioCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string; title?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      url: record.content?.url || record.url || '',
      title: record.content?.title ?? null,
    },
  }
}

export function recordToAudioUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string; title?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToAudioCreatePayload(record)
}

export function audioToRecord(item: AudioItem) {
  return itemToBaseRecord(item)
}
