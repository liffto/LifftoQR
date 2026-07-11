from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.event import EventCreate, EventUpdate
from app.serializers.response_serializer import success_response
from app.services.event_service import EventService


class EventController:
    def __init__(self, service: EventService) -> None:
        self.service = service

    async def create_event(self, payload: EventCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        event = self.service.create_event(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(event.model_dump(mode="json", by_alias=True)),
        )

    async def get_event(self, event_id: int) -> JSONResponse:
        event = self.service.get_event(event_id)
        if event is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event QR not found",
            )
        return JSONResponse(content=success_response(event.model_dump(mode="json", by_alias=True)))

    async def list_events(self) -> JSONResponse:
        events = self.service.list_events()
        return JSONResponse(
            content=success_response(
                [event.model_dump(mode="json", by_alias=True) for event in events]
            )
        )

    async def update_event(
        self, event_id: int, payload: EventUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        event = self.service.update_event(event_id, payload)
        if event is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event QR not found",
            )
        return JSONResponse(content=success_response(event.model_dump(mode="json", by_alias=True)))

    async def delete_event(self, event_id: int) -> JSONResponse:
        deleted = self.service.delete_event(event_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Event QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Event QR deleted successfully"})
        )
