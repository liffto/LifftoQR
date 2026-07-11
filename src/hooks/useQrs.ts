import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteQr, listQrs, qrToRecord } from '../api/qrcode/qr'

export const qrsQueryKey = ['qrs'] as const

export function useQrs() {
  return useQuery({
    queryKey: qrsQueryKey,
    queryFn: listQrs,
    select: (items) => items.map(qrToRecord),
  })
}

export function useDeleteQr() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (qrId: number) => deleteQr(qrId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
