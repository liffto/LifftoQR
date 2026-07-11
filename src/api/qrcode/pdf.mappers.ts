import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { PdfItem } from './pdf'

export function recordToPdfCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      url: record.content?.url || record.url || '',
    },
  }
}

export function recordToPdfUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToPdfCreatePayload(record)
}

export function pdfToRecord(item: PdfItem) {
  return itemToBaseRecord(item)
}
