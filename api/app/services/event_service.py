from app.repositories.event_repository import EventRepository
from app.schemas.event import EventCreate, EventItemResponse, EventUpdate


class EventService:
    def __init__(self, repository: EventRepository) -> None:
        self.repository = repository

    def create_event(self, payload: EventCreate) -> EventItemResponse:
        qr = self.repository.create(payload)
        return EventItemResponse.from_qr(qr)

    def get_event(self, qr_id: int) -> EventItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return EventItemResponse.from_qr(qr)

    def list_events(self) -> list[EventItemResponse]:
        qrs = self.repository.list_all()
        return [EventItemResponse.from_qr(qr) for qr in qrs]

    def update_event(self, qr_id: int, payload: EventUpdate) -> EventItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return EventItemResponse.from_qr(qr)

    def delete_event(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
