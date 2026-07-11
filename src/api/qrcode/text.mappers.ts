import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { TextItem } from './text'

export function recordToTextCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { text?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      text: record.content?.text || '',
    },
  }
}

export function recordToTextUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { text?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToTextCreatePayload(record)
}

export function textToRecord(item: TextItem) {
  return itemToBaseRecord(item)
}
