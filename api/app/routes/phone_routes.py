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
async def create_phone(
    payload: PhoneCreate,
    request: Request,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return await controller.create_phone(payload, request.state.user)


@router.get("")
async def list_phones(
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return await controller.list_phones()


@router.get("/{phone_id}")
async def get_phone(
    phone_id: int,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return await controller.get_phone(phone_id)


@router.put("/{phone_id}")
async def update_phone(
    phone_id: int,
    payload: PhoneUpdate,
    request: Request,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return await controller.update_phone(phone_id, payload, request.state.user)


@router.delete("/{phone_id}")
async def delete_phone(
    phone_id: int,
    controller: PhoneController = Depends(get_phone_controller),
) -> JSONResponse:
    return await controller.delete_phone(phone_id)
