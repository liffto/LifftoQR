import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { AppItem } from './app'

export function recordToAppCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { iosUrl?: string | null; androidUrl?: string | null; fallbackUrl?: string | null; name?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      iosUrl: record.content?.iosUrl ?? null,
      androidUrl: record.content?.androidUrl ?? null,
      fallbackUrl: record.content?.fallbackUrl ?? null,
      name: record.content?.name?.trim() || record.name || 'App',
    },
  }
}

export function recordToAppUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { iosUrl?: string | null; androidUrl?: string | null; fallbackUrl?: string | null; name?: string }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToAppCreatePayload(record)
}

export function appToRecord(item: AppItem) {
  return itemToBaseRecord(item)
}
