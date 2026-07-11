import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { WhatsappItem } from './whatsapp'

export function recordToWhatsappCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { country_code?: string; countryCode?: string; phone?: string; message?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      country_code: record.content?.country_code || record.content?.countryCode || '',
      phone: record.content?.phone || '',
      message: record.content?.message ?? null,
    },
  }
}

export function recordToWhatsappUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { country_code?: string; countryCode?: string; phone?: string; message?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToWhatsappCreatePayload(record)
}

export function whatsappToRecord(item: WhatsappItem) {
  return itemToBaseRecord(item)
}
