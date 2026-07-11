import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { SmsItem } from './sms'

export function recordToSmsCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { number?: string; message?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      number: record.content?.number || '',
      message: record.content?.message ?? null,
    },
  }
}

export function recordToSmsUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { number?: string; message?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToSmsCreatePayload(record)
}

export function smsToRecord(item: SmsItem) {
  return itemToBaseRecord(item)
}
