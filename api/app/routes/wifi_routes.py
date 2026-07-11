from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.wifi_controller import WifiController
from app.dependencies.dependencies import get_wifi_controller
from app.schemas.wifi import WifiCreate, WifiUpdate


router = APIRouter(
    prefix="/wifis",
    tags=["wifis"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_wifi(
    payload: WifiCreate,
    request: Request,
    controller: WifiController = Depends(get_wifi_controller),
) -> JSONResponse:
    return await controller.create_wifi(payload, request.state.user)


@router.get("")
async def list_wifis(
    controller: WifiController = Depends(get_wifi_controller),
) -> JSONResponse:
    return await controller.list_wifis()


@router.get("/{wifi_id}")
async def get_wifi(
    wifi_id: int,
    controller: WifiController = Depends(get_wifi_controller),
) -> JSONResponse:
    return await controller.get_wifi(wifi_id)


@router.put("/{wifi_id}")
async def update_wifi(
    wifi_id: int,
    payload: WifiUpdate,
    request: Request,
    controller: WifiController = Depends(get_wifi_controller),
) -> JSONResponse:
    return await controller.update_wifi(wifi_id, payload, request.state.user)


@router.delete("/{wifi_id}")
async def delete_wifi(
    wifi_id: int,
    controller: WifiController = Depends(get_wifi_controller),
) -> JSONResponse:
    return await controller.delete_wifi(wifi_id)
