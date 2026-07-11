from app.repositories.coupon_repository import CouponRepository
from app.schemas.coupon import CouponCreate, CouponItemResponse, CouponUpdate


class CouponService:
    def __init__(self, repository: CouponRepository) -> None:
        self.repository = repository

    def create_coupon(self, payload: CouponCreate) -> CouponItemResponse:
        qr = self.repository.create(payload)
        return CouponItemResponse.from_qr(qr)

    def get_coupon(self, qr_id: int) -> CouponItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return CouponItemResponse.from_qr(qr)

    def list_coupons(self) -> list[CouponItemResponse]:
        qrs = self.repository.list_all()
        return [CouponItemResponse.from_qr(qr) for qr in qrs]

    def update_coupon(self, qr_id: int, payload: CouponUpdate) -> CouponItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return CouponItemResponse.from_qr(qr)

    def delete_coupon(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
