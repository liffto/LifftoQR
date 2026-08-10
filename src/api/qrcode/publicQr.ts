import { api } from '../axios'
import type { ApiSuccessResponse } from './types'

export interface PublicQr {
  typeKey: string
  type: string
  name: string
  content: Record<string, unknown>
}

/** Fetch a scanned QR's content. Public — no session required. */
export async function getPublicQr(slug: string): Promise<PublicQr> {
  const { data } = await api.get<ApiSuccessResponse<PublicQr>>(
    `/public/qrs/${encodeURIComponent(slug)}`,
  )
  return data.data
}

/**
 * Absolute URL of the downloadable .vcf.
 *
 * Deliberately a real server URL rather than a generated Blob: iOS Safari
 * ignores blob/data downloads for contacts, but follows a genuine
 * `text/vcard` response straight into the Contacts app.
 */
export function vcardFileUrl(slug: string): string {
  const base = String(api.defaults.baseURL || '').replace(/\/$/, '')
  return `${base}/public/qrs/${encodeURIComponent(slug)}/contact.vcf`
}
