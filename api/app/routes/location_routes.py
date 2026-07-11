from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.location_controller import LocationController
from app.dependencies.dependencies import get_location_controller
from app.schemas.location import LocationCreate, LocationUpdate


router = APIRouter(
    prefix="/locations",
    tags=["locations"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_location(
    payload: LocationCreate,
    request: Request,
    controller: LocationController = Depends(get_location_controller),
) -> JSONResponse:
    return await controller.create_location(payload, request.state.user)


@router.get("")
async def list_locations(
    controller: LocationController = Depends(get_location_controller),
) -> JSONResponse:
    return await controller.list_locations()


@router.get("/{location_id}")
async def get_location(
    location_id: int,
    controller: LocationController = Depends(get_location_controller),
) -> JSONResponse:
    return await controller.get_location(location_id)


@router.put("/{location_id}")
async def update_location(
    location_id: int,
    payload: LocationUpdate,
    request: Request,
    controller: LocationController = Depends(get_location_controller),
) -> JSONResponse:
    return await controller.update_location(location_id, payload, request.state.user)


@router.delete("/{location_id}")
async def delete_location(
    location_id: int,
    controller: LocationController = Depends(get_location_controller),
) -> JSONResponse:
    return await controller.delete_location(location_id)
