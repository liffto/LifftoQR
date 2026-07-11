import { useQuery } from '@tanstack/react-query'
import { getQr, qrToRecord } from '../api/qrcode/qr'

export const qrQueryKey = (qrId: number) => ['qr', qrId] as const

export function useQr(qrId: number | null) {
  return useQuery({
    queryKey: qrQueryKey(qrId ?? 0),
    enabled: qrId != null && Number.isFinite(qrId) && qrId > 0,
    queryFn: () => getQr(qrId as number),
    select: qrToRecord,
  })
}
