from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.whatsapp_controller import WhatsappController
from app.dependencies.dependencies import get_whatsapp_controller
from app.schemas.whatsapp import WhatsappCreate, WhatsappUpdate


router = APIRouter(
    prefix="/whatsapp",
    tags=["whatsapp"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_whatsapp(
    payload: WhatsappCreate,
    request: Request,
    controller: WhatsappController = Depends(get_whatsapp_controller),
) -> JSONResponse:
    return controller.create_whatsapp(payload, request.state.user)


@router.get("")
def list_whatsapp(
    controller: WhatsappController = Depends(get_whatsapp_controller),
) -> JSONResponse:
    return controller.list_whatsapp()


@router.get("/{whatsapp_id}")
def get_whatsapp(
    whatsapp_id: int,
    controller: WhatsappController = Depends(get_whatsapp_controller),
) -> JSONResponse:
    return controller.get_whatsapp(whatsapp_id)


@router.put("/{whatsapp_id}")
def update_whatsapp(
    whatsapp_id: int,
    payload: WhatsappUpdate,
    request: Request,
    controller: WhatsappController = Depends(get_whatsapp_controller),
) -> JSONResponse:
    return controller.update_whatsapp(whatsapp_id, payload, request.state.user)


@router.delete("/{whatsapp_id}")
def delete_whatsapp(
    whatsapp_id: int,
    controller: WhatsappController = Depends(get_whatsapp_controller),
) -> JSONResponse:
    return controller.delete_whatsapp(whatsapp_id)
