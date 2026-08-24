from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.coupon_controller import CouponController
from app.dependencies.dependencies import get_coupon_controller
from app.schemas.coupon import CouponCreate, CouponUpdate


router = APIRouter(
    prefix="/coupons",
    tags=["coupons"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_coupon(
    payload: CouponCreate,
    request: Request,
    controller: CouponController = Depends(get_coupon_controller),
) -> JSONResponse:
    return controller.create_coupon(payload, request.state.user)


@router.get("")
def list_coupons(
    controller: CouponController = Depends(get_coupon_controller),
) -> JSONResponse:
    return controller.list_coupons()


@router.get("/{coupon_id}")
def get_coupon(
    coupon_id: int,
    controller: CouponController = Depends(get_coupon_controller),
) -> JSONResponse:
    return controller.get_coupon(coupon_id)


@router.put("/{coupon_id}")
def update_coupon(
    coupon_id: int,
    payload: CouponUpdate,
    request: Request,
    controller: CouponController = Depends(get_coupon_controller),
) -> JSONResponse:
    return controller.update_coupon(coupon_id, payload, request.state.user)


@router.delete("/{coupon_id}")
def delete_coupon(
    coupon_id: int,
    controller: CouponController = Depends(get_coupon_controller),
) -> JSONResponse:
    return controller.delete_coupon(coupon_id)
