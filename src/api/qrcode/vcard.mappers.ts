import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { VcardItem } from './vcard'

export function recordToVcardCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { photo?: string | null; logo?: string | null; first_name?: string; firstName?: string; last_name?: string | null; lastName?: string | null; org?: string | null; title?: string | null; phone?: string | null; work_phone?: string | null; workPhone?: string | null; email?: string | null; url?: string | null; street?: string | null; city?: string | null; state?: string | null; zip?: string | null; country?: string | null; note?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      photo: record.content?.photo ?? null,
      logo: record.content?.logo ?? null,
      first_name: record.content?.first_name || record.content?.firstName || '',
      last_name: record.content?.last_name ?? record.content?.lastName ?? null,
      org: record.content?.org ?? null,
      title: record.content?.title ?? null,
      phone: record.content?.phone ?? null,
      work_phone: record.content?.work_phone ?? record.content?.workPhone ?? null,
      email: record.content?.email ?? null,
      url: record.content?.url ?? null,
      street: record.content?.street ?? null,
      city: record.content?.city ?? null,
      state: record.content?.state ?? null,
      zip: record.content?.zip ?? null,
      country: record.content?.country ?? null,
      note: record.content?.note ?? null,
    },
  }
}

export function recordToVcardUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { photo?: string | null; logo?: string | null; first_name?: string; firstName?: string; last_name?: string | null; lastName?: string | null; org?: string | null; title?: string | null; phone?: string | null; work_phone?: string | null; workPhone?: string | null; email?: string | null; url?: string | null; street?: string | null; city?: string | null; state?: string | null; zip?: string | null; country?: string | null; note?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToVcardCreatePayload(record)
}

export function vcardToRecord(item: VcardItem) {
  return itemToBaseRecord(item)
}
