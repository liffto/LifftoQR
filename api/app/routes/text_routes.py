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
def create_text(
    payload: TextCreate,
    request: Request,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return controller.create_text(payload, request.state.user)


@router.get("")
def list_texts(
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return controller.list_texts()


@router.get("/{text_id}")
def get_text(
    text_id: int,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return controller.get_text(text_id)


@router.put("/{text_id}")
def update_text(
    text_id: int,
    payload: TextUpdate,
    request: Request,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return controller.update_text(text_id, payload, request.state.user)


@router.delete("/{text_id}")
def delete_text(
    text_id: int,
    controller: TextController = Depends(get_text_controller),
) -> JSONResponse:
    return controller.delete_text(text_id)
