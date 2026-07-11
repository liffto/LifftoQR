from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.app_controller import AppController
from app.dependencies.dependencies import get_app_controller
from app.schemas.app import AppCreate, AppUpdate


router = APIRouter(
    prefix="/apps",
    tags=["apps"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_app(
    payload: AppCreate,
    request: Request,
    controller: AppController = Depends(get_app_controller),
) -> JSONResponse:
    return await controller.create_app(payload, request.state.user)


@router.get("")
async def list_apps(
    controller: AppController = Depends(get_app_controller),
) -> JSONResponse:
    return await controller.list_apps()


@router.get("/{app_id}")
async def get_app(
    app_id: int,
    controller: AppController = Depends(get_app_controller),
) -> JSONResponse:
    return await controller.get_app(app_id)


@router.put("/{app_id}")
async def update_app(
    app_id: int,
    payload: AppUpdate,
    request: Request,
    controller: AppController = Depends(get_app_controller),
) -> JSONResponse:
    return await controller.update_app(app_id, payload, request.state.user)


@router.delete("/{app_id}")
async def delete_app(
    app_id: int,
    controller: AppController = Depends(get_app_controller),
) -> JSONResponse:
    return await controller.delete_app(app_id)
