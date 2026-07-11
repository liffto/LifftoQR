import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createPdf,
  getPdf,
  listPdfs,
  updatePdf,
} from '../api/qrcode/pdf'
import type { PdfCreatePayload, PdfUpdatePayload } from '../api/qrcode/pdf'
import { pdfToRecord } from '../api/qrcode/pdf.mappers'
import { qrsQueryKey } from './useQrs'

export const pdfQueryKey = (pdfId: number) => ['pdf', pdfId] as const
export const pdfsQueryKey = ['pdfs'] as const

export function usePdf(pdfId: number | null) {
  return useQuery({
    queryKey: pdfQueryKey(pdfId ?? 0),
    enabled: pdfId != null && Number.isFinite(pdfId) && pdfId > 0,
    queryFn: () => getPdf(pdfId as number),
    select: pdfToRecord,
  })
}

export function usePdfList() {
  return useQuery({
    queryKey: pdfsQueryKey,
    queryFn: listPdfs,
    select: (items) => items.map(pdfToRecord),
  })
}

export function useCreatePdf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: PdfCreatePayload) => createPdf(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pdfsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdatePdf() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      pdfId,
      payload,
    }: {
      pdfId: number
      payload: PdfUpdatePayload
    }) => updatePdf(pdfId, payload),
    onSuccess: (_, { pdfId }) => {
      queryClient.invalidateQueries({ queryKey: pdfsQueryKey })
      queryClient.invalidateQueries({ queryKey: pdfQueryKey(pdfId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
