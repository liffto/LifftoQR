import { useQuery } from '@tanstack/react-query'
import { getScanSeries } from '../api/qrcode/qr'

/** Daily scan/unique counts for one code, for the graph in the QR details
 *  modal. Only fetched while the graph is actually open (enabled). */
export function useScanSeries(qrId: number, days: number, enabled: boolean) {
  return useQuery({
    queryKey: ['scan-series', qrId, days],
    queryFn: () => getScanSeries(qrId, days),
    enabled: enabled && Boolean(qrId),
    staleTime: 60 * 1000,
  })
}
