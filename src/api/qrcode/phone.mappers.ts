import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { PhoneItem } from './phone'

export function recordToPhoneCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { phone?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      phone: record.content?.phone || '',
    },
  }
}

export function recordToPhoneUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { phone?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToPhoneCreatePayload(record)
}

export function phoneToRecord(item: PhoneItem) {
  return itemToBaseRecord(item)
}
