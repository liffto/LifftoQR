from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.phone_controller import PhoneController
from app.dependencies.dependencies import get_phone_controller
from app.schemas.phone import PhoneCreate, PhoneUpdate


router = APIRouter(
    prefix="/phones",
    tags=["phones"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_phone(
    payload: PhoneCreate,
    request: Request,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return controller.create_phone(payload, request.state.user)


@router.get("")
def list_phones(
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return controller.list_phones()


@router.get("/{phone_id}")
def get_phone(
    phone_id: int,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return controller.get_phone(phone_id)


@router.put("/{phone_id}")
def update_phone(
    phone_id: int,
    payload: PhoneUpdate,
    request: Request,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return controller.update_phone(phone_id, payload, request.state.user)


@router.delete("/{phone_id}")
def delete_phone(
    phone_id: int,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return controller.delete_phone(phone_id)
