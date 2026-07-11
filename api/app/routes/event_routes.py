from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.event_controller import EventController
from app.dependencies.dependencies import get_event_controller
from app.schemas.event import EventCreate, EventUpdate


router = APIRouter(
    prefix="/events",
    tags=["events"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_event(
    payload: EventCreate,
    request: Request,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return await controller.create_event(payload, request.state.user)


@router.get("")
async def list_events(
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return await controller.list_events()


@router.get("/{event_id}")
async def get_event(
    event_id: int,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return await controller.get_event(event_id)


@router.put("/{event_id}")
async def update_event(
    event_id: int,
    payload: EventUpdate,
    request: Request,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return await controller.update_event(event_id, payload, request.state.user)


@router.delete("/{event_id}")
async def delete_event(
    event_id: int,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return await controller.delete_event(event_id)
