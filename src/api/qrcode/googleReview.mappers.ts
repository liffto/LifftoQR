import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { GoogleReviewItem } from './googleReview'

export function recordToGoogleReviewCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string; businessName?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      url: record.content?.url || record.url || '',
      businessName:
        record.content?.businessName?.trim() || record.name || 'Business',
    },
  }
}

export function recordToGoogleReviewUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string; businessName?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToGoogleReviewCreatePayload(record)
}

export function googleReviewToRecord(item: GoogleReviewItem) {
  return itemToBaseRecord(item)
}
