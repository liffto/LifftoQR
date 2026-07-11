import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { LinkTreeItem } from './linkTree'

export function recordToLinkTreeCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; links?: Array<{ label?: string; url?: string; displayOrder?: number; display_order?: number }> }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      title: record.content?.title || '',
      links: (record.content?.links || []).map((link, index) => ({
        label: link.label || '',
        url: link.url || '',
        display_order: link.displayOrder ?? link.display_order ?? index + 1,
      })),
    },
  }
}

export function recordToLinkTreeUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; links?: Array<{ label?: string; url?: string; displayOrder?: number; display_order?: number }> }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToLinkTreeCreatePayload(record)
}

export function linkTreeToRecord(item: LinkTreeItem) {
  return itemToBaseRecord(item)
}
