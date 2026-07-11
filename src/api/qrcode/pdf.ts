import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface PdfContent {
  id: number
  qr_id: number
  url: string
}

export interface PdfContentPayload {
  url: string
}

export interface PdfCreatePayload extends QrCreatePayloadBase {
  content: PdfContentPayload
}

export interface PdfUpdatePayload extends QrUpdatePayloadBase {
  content?: PdfContentPayload
}

export interface PdfItem extends QrItemBase {
  content: PdfContent
}

export type PdfDetail = PdfItem
export type PdfListItem = PdfItem

export async function createPdf(payload: PdfCreatePayload): Promise<PdfItem> {
  const { data } = await api.post<ApiSuccessResponse<PdfItem>>('/pdfs', payload)
  return data.data
}

export async function listPdfs(): Promise<PdfItem[]> {
  const { data } = await api.get<ApiSuccessResponse<PdfItem[]>>('/pdfs')
  return data.data
}

export async function getPdf(pdfId: number): Promise<PdfDetail> {
  const { data } = await api.get<ApiSuccessResponse<PdfDetail>>(`/pdfs/${pdfId}`)
  return data.data
}

export async function updatePdf(
  pdfId: number,
  payload: PdfUpdatePayload,
): Promise<PdfItem> {
  const { data } = await api.put<ApiSuccessResponse<PdfItem>>(
    `/pdfs/${pdfId}`,
    payload,
  )
  return data.data
}

export async function deletePdf(pdfId: number): Promise<void> {
  await api.delete(`/pdfs/${pdfId}`)
}
