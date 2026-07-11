import { defaultDesign } from '../../lib/store'
import { baseRecordFields, designToTemplate, itemToBaseRecord, templateToDesign } from './mappers.shared'
import type { WebsiteItem } from './website'

export { designToTemplate, templateToDesign }

export function recordToWebsiteCreatePayload(record: {
  name: string
  url: string
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
    url: record.url,
    content: {
      url: record.content?.url || record.url,
    },
  }
}

export function recordToWebsiteUpdatePayload(record: {
  name: string
  url: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToWebsiteCreatePayload(record)
}

export function websiteToRecord(website: WebsiteItem) {
  return itemToBaseRecord(website)
}
