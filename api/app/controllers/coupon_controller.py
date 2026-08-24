from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.coupon import CouponCreate, CouponUpdate
from app.serializers.response_serializer import success_response
from app.services.coupon_service import CouponService


class CouponController:
    def __init__(self, service: CouponService) -> None:
        self.service = service

    def create_coupon(self, payload: CouponCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_coupon(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    def get_coupon(self, coupon_id: int) -> JSONResponse:
        item = self.service.get_coupon(coupon_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def list_coupons(self) -> JSONResponse:
        items = self.service.list_coupons()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    def update_coupon(
        self, coupon_id: int, payload: CouponUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_coupon(coupon_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def delete_coupon(self, coupon_id: int) -> JSONResponse:
        deleted = self.service.delete_coupon(coupon_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Coupon QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Coupon QR deleted successfully"})
        )
