import { useQuery } from '@tanstack/react-query'
import { getScanTracking } from '../api/qrcode/qr'

export const scanTrackingQueryKey = ['scan-tracking'] as const

/**
 * When unique-scan counting started.
 *
 * Scans were a single integer with no history until the scan_events table
 * landed, so a unique figure cannot speak for anything that happened before
 * the first recorded scan. Without saying so, a code showing 40 total and 0
 * unique reads as a bug rather than as "we only started counting on Thursday".
 *
 * The date comes from the earliest row rather than a constant, so it stays
 * true if those rows are ever purged or the table is rebuilt.
 */
export function useScanTracking() {
  return useQuery({
    queryKey: scanTrackingQueryKey,
    queryFn: getScanTracking,
    // It only changes once, the first time anything is ever scanned.
    staleTime: 60 * 60 * 1000,
  })
}
