from fastapi import APIRouter, Depends, Query
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.controllers.qr_controller import QrController
from app.dependencies.dependencies import get_qr_controller


router = APIRouter(
    prefix="/qrs",
    tags=["qrs"],
    dependencies=[Depends(get_current_user)],
)


@router.get("")
def list_qrs(
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return controller.list_qrs(user)


# Before /{qr_id}: a literal path has to be declared ahead of the parameterised
# one or FastAPI tries to read "scan-tracking" as an int and 422s.
@router.get("/scan-tracking")
def scan_tracking(
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return controller.scan_tracking(user)


@router.get("/{qr_id}/scans")
def scan_series(
    qr_id: int,
    days: int = Query(30, ge=1, le=365),
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return controller.scan_series(qr_id, days, user)


@router.get("/{qr_id}")
def get_qr(
    qr_id: int,
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return controller.get_qr(qr_id, user)


@router.delete("/{qr_id}")
def delete_qr(
    qr_id: int,
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return controller.delete_qr(qr_id, user)
