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
def create_event(
    payload: EventCreate,
    request: Request,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return controller.create_event(payload, request.state.user)


@router.get("")
def list_events(
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return controller.list_events()


@router.get("/{event_id}")
def get_event(
    event_id: int,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return controller.get_event(event_id)


@router.put("/{event_id}")
def update_event(
    event_id: int,
    payload: EventUpdate,
    request: Request,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return controller.update_event(event_id, payload, request.state.user)


@router.delete("/{event_id}")
def delete_event(
    event_id: int,
    controller: EventController = Depends(get_event_controller),
) -> JSONResponse:
    return controller.delete_event(event_id)
