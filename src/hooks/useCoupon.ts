import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCoupon,
  getCoupon,
  listCoupons,
  updateCoupon,
} from '../api/qrcode/coupon'
import type { CouponCreatePayload, CouponUpdatePayload } from '../api/qrcode/coupon'
import { couponToRecord } from '../api/qrcode/coupon.mappers'
import { qrsQueryKey } from './useQrs'

export const couponQueryKey = (couponId: number) => ['coupon', couponId] as const
export const couponsQueryKey = ['coupons'] as const

export function useCoupon(couponId: number | null) {
  return useQuery({
    queryKey: couponQueryKey(couponId ?? 0),
    enabled: couponId != null && Number.isFinite(couponId) && couponId > 0,
    queryFn: () => getCoupon(couponId as number),
    select: couponToRecord,
  })
}

export function useCouponList() {
  return useQuery({
    queryKey: couponsQueryKey,
    queryFn: listCoupons,
    select: (items) => items.map(couponToRecord),
  })
}

export function useCreateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (payload: CouponCreatePayload) => createCoupon(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}

export function useUpdateCoupon() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({
      couponId,
      payload,
    }: {
      couponId: number
      payload: CouponUpdatePayload
    }) => updateCoupon(couponId, payload),
    onSuccess: (_, { couponId }) => {
      queryClient.invalidateQueries({ queryKey: couponsQueryKey })
      queryClient.invalidateQueries({ queryKey: couponQueryKey(couponId) })
      queryClient.invalidateQueries({ queryKey: qrsQueryKey })
    },
  })
}
