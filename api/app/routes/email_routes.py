from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.email_controller import EmailController
from app.dependencies.dependencies import get_email_controller
from app.schemas.email import EmailCreate, EmailUpdate


router = APIRouter(
    prefix="/emails",
    tags=["emails"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_email(
    payload: EmailCreate,
    request: Request,
    controller: EmailController = Depends(get_email_controller),
) -> JSONResponse:
    return await controller.create_email(payload, request.state.user)


@router.get("")
async def list_emails(
    controller: EmailController = Depends(get_email_controller),
) -> JSONResponse:
    return await controller.list_emails()


@router.get("/{email_id}")
async def get_email(
    email_id: int,
    controller: EmailController = Depends(get_email_controller),
) -> JSONResponse:
    return await controller.get_email(email_id)


@router.put("/{email_id}")
async def update_email(
    email_id: int,
    payload: EmailUpdate,
    request: Request,
    controller: EmailController = Depends(get_email_controller),
) -> JSONResponse:
    return await controller.update_email(email_id, payload, request.state.user)


@router.delete("/{email_id}")
async def delete_email(
    email_id: int,
    controller: EmailController = Depends(get_email_controller),
) -> JSONResponse:
    return await controller.delete_email(email_id)
