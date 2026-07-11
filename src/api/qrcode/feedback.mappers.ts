import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { FeedbackItem } from './feedback'

export function recordToFeedbackCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string; prefillKey?: string | null; prefillValue?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      url: record.content?.url || record.url || '',
      prefillKey: record.content?.prefillKey ?? null,
      prefillValue: record.content?.prefillValue ?? null,
    },
  }
}

export function recordToFeedbackUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string; prefillKey?: string | null; prefillValue?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToFeedbackCreatePayload(record)
}

export function feedbackToRecord(item: FeedbackItem) {
  return itemToBaseRecord(item)
}
