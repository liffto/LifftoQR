import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { InvitationItem } from './invitation'

export function recordToInvitationCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      title: record.content?.title || '',
      url: record.content?.url || record.url || '',
    },
  }
}

export function recordToInvitationUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { title?: string; url?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToInvitationCreatePayload(record)
}

export function invitationToRecord(item: InvitationItem) {
  return itemToBaseRecord(item)
}
