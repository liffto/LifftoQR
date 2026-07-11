from fastapi import APIRouter, Depends
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
async def list_qrs(
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return await controller.list_qrs(user)


@router.get("/{qr_id}")
async def get_qr(
    qr_id: int,
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return await controller.get_qr(qr_id, user)


@router.delete("/{qr_id}")
async def delete_qr(
    qr_id: int,
    user: User = Depends(get_current_user),
    controller: QrController = Depends(get_qr_controller),
) -> JSONResponse:
    return await controller.delete_qr(qr_id, user)
