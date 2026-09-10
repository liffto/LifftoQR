import { api } from '../axios'
import type {
  ApiSuccessResponse,
  QrCreatePayloadBase,
  QrItemBase,
  QrUpdatePayloadBase,
} from './types'

export interface CouponContent {
  id: number
  qr_id: number
  title: string
  code: string
  expiry: string | null
  description: string | null
  url: string | null
  logo: string | null
}

export interface CouponContentPayload {
  title: string
  code: string
  expiry?: string | null
  description?: string | null
  url?: string | null
  logo?: string | null
}

export interface CouponCreatePayload extends QrCreatePayloadBase {
  content: CouponContentPayload
}

export interface CouponUpdatePayload extends QrUpdatePayloadBase {
  content?: CouponContentPayload
}

export interface CouponItem extends QrItemBase {
  content: CouponContent
}

export type CouponDetail = CouponItem
export type CouponListItem = CouponItem

export async function createCoupon(payload: CouponCreatePayload): Promise<CouponItem> {
  const { data } = await api.post<ApiSuccessResponse<CouponItem>>('/coupons', payload)
  return data.data
}

export async function listCoupons(): Promise<CouponItem[]> {
  const { data } = await api.get<ApiSuccessResponse<CouponItem[]>>('/coupons')
  return data.data
}

export async function getCoupon(couponId: number): Promise<CouponDetail> {
  const { data } = await api.get<ApiSuccessResponse<CouponDetail>>(`/coupons/${couponId}`)
  return data.data
}

export async function updateCoupon(
  couponId: number,
  payload: CouponUpdatePayload,
): Promise<CouponItem> {
  const { data } = await api.put<ApiSuccessResponse<CouponItem>>(
    `/coupons/${couponId}`,
    payload,
  )
  return data.data
}

export async function deleteCoupon(couponId: number): Promise<void> {
  await api.delete(`/coupons/${couponId}`)
}
