import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { EmailItem } from './email'

export function recordToEmailCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { to?: string; subject?: string | null; body?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      to: record.content?.to || '',
      subject: record.content?.subject ?? null,
      body: record.content?.body ?? null,
    },
  }
}

export function recordToEmailUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { to?: string; subject?: string | null; body?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToEmailCreatePayload(record)
}

export function emailToRecord(item: EmailItem) {
  return itemToBaseRecord(item)
}
