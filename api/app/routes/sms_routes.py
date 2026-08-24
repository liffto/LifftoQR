from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.sms_controller import SmsController
from app.dependencies.dependencies import get_sms_controller
from app.schemas.sms import SmsCreate, SmsUpdate


router = APIRouter(
    prefix="/sms",
    tags=["sms"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_sms(
    payload: SmsCreate,
    request: Request,
    controller: SmsController = Depends(get_sms_controller),
) -> JSONResponse:
    return controller.create_sms(payload, request.state.user)


@router.get("")
def list_sms(
    controller: SmsController = Depends(get_sms_controller),
) -> JSONResponse:
    return controller.list_sms()


@router.get("/{sms_id}")
def get_sms(
    sms_id: int,
    controller: SmsController = Depends(get_sms_controller),
) -> JSONResponse:
    return controller.get_sms(sms_id)


@router.put("/{sms_id}")
def update_sms(
    sms_id: int,
    payload: SmsUpdate,
    request: Request,
    controller: SmsController = Depends(get_sms_controller),
) -> JSONResponse:
    return controller.update_sms(sms_id, payload, request.state.user)


@router.delete("/{sms_id}")
def delete_sms(
    sms_id: int,
    controller: SmsController = Depends(get_sms_controller),
) -> JSONResponse:
    return controller.delete_sms(sms_id)
