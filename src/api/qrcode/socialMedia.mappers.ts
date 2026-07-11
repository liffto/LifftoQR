import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { SocialMediaItem } from './socialMedia'

export function recordToSocialMediaCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { platform?: string; handle?: string | null; url?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      platform: record.content?.platform || '',
      handle: record.content?.handle ?? null,
      url: record.content?.url ?? null,
    },
  }
}

export function recordToSocialMediaUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { platform?: string; handle?: string | null; url?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToSocialMediaCreatePayload(record)
}

export function socialMediaToRecord(item: SocialMediaItem) {
  return itemToBaseRecord(item)
}
