from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.text_controller import TextController
from app.dependencies.dependencies import get_text_controller
from app.schemas.text import TextCreate, TextUpdate


router = APIRouter(
    prefix="/texts",
    tags=["texts"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_text(
    payload: TextCreate,
    request: Request,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return await controller.create_text(payload, request.state.user)


@router.get("")
async def list_texts(
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return await controller.list_texts()


@router.get("/{text_id}")
async def get_text(
    text_id: int,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return await controller.get_text(text_id)


@router.put("/{text_id}")
async def update_text(
    text_id: int,
    payload: TextUpdate,
    request: Request,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return await controller.update_text(text_id, payload, request.state.user)


@router.delete("/{text_id}")
async def delete_text(
    text_id: int,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return await controller.delete_text(text_id)
