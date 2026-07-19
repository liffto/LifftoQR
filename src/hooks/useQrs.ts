import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteQr, listQrs, qrToRecord, setQrStatus } from '../api/qrcode/qr'
import type { QrListItem } from '../api/qrcode/qr'

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

export function useSetQrStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      id,
      typeKey,
      status,
    }: {
      id: number
      typeKey: string
      status: 'Active' | 'Inactive'
    }) => setQrStatus(typeKey, id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: qrsQueryKey })
      const previous = queryClient.getQueryData<QrListItem[]>(qrsQueryKey)
      queryClient.setQueryData<QrListItem[]>(qrsQueryKey, (old) =>
        old?.map((q) => (q.id === id ? { ...q, status } : q)),
      )
      return { previous }
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(qrsQueryKey, context.previous)
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
