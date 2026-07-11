import { defaultDesign } from '../../lib/store'
import { baseRecordFields, itemToBaseRecord } from './mappers.shared'
import type { WifiItem } from './wifi'

export function recordToWifiCreatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { ssid?: string; auth?: string; hidden?: boolean; password?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return {
    ...baseRecordFields(record),
    content: {
      ssid: record.content?.ssid || '',
      auth: record.content?.auth || 'WPA',
      hidden: Boolean(record.content?.hidden),
      password: record.content?.password ?? null,
    },
  }
}

export function recordToWifiUpdatePayload(record: {
  name: string
  url?: string
  slug: string
  dynamic: boolean
  qrType: string
  folder?: string
  status?: string
  scans?: number
  content?: { ssid?: string; auth?: string; hidden?: boolean; password?: string | null }
  design: ReturnType<typeof defaultDesign>
}) {
  return recordToWifiCreatePayload(record)
}

export function wifiToRecord(item: WifiItem) {
  return itemToBaseRecord(item)
}
