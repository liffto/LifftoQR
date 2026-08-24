from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.vcard_controller import VcardController
from app.dependencies.dependencies import get_vcard_controller
from app.schemas.vcard import VcardCreate, VcardUpdate


router = APIRouter(
    prefix="/vcards",
    tags=["vcards"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_vcard(
    payload: VcardCreate,
    request: Request,
    controller: VcardController = Depends(get_vcard_controller),
) -> JSONResponse:
    return controller.create_vcard(payload, request.state.user)


@router.get("")
def list_vcards(
    controller: VcardController = Depends(get_vcard_controller),
) -> JSONResponse:
    return controller.list_vcards()


@router.get("/{vcard_id}")
def get_vcard(
    vcard_id: int,
    controller: VcardController = Depends(get_vcard_controller),
) -> JSONResponse:
    return controller.get_vcard(vcard_id)


@router.put("/{vcard_id}")
def update_vcard(
    vcard_id: int,
    payload: VcardUpdate,
    request: Request,
    controller: VcardController = Depends(get_vcard_controller),
) -> JSONResponse:
    return controller.update_vcard(vcard_id, payload, request.state.user)


@router.delete("/{vcard_id}")
def delete_vcard(
    vcard_id: int,
    controller: VcardController = Depends(get_vcard_controller),
) -> JSONResponse:
    return controller.delete_vcard(vcard_id)
