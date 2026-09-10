import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { CouponItem } from './coupon'

export function recordToCouponCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; code?: string; expiry?: string | null; description?: string | null; url?: string | null; logo?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      title: record.content?.title || '',
      code: record.content?.code || '',
      expiry: record.content?.expiry ?? null,
      description: record.content?.description ?? null,
      url: record.content?.url ?? null,
      logo: record.content?.logo ?? null,
    },
  }
}

export function recordToCouponUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; code?: string; expiry?: string | null; description?: string | null; url?: string | null; logo?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToCouponCreatePayload(record)
}

export function couponToRecord(item: CouponItem) {
  return itemToBaseRecord(item)
}
