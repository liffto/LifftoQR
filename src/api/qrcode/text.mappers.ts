import { defaultDesign, shortUrlAbsolute, SHORT_BASE_URL } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { TextItem } from './text'

function resolveTextUrl(record: {
  url?: string
  slug: string
  content?: { text?: string }
}) {
  if (record.url && record.url.trim()) return record.url
  if (record.slug) return shortUrlAbsolute(record.slug)
  const text = record.content?.text?.trim()
  if (text) return text.slice(0, 500)
  return `${SHORT_BASE_URL}/text`
}

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
    url: resolveTextUrl(record),
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
