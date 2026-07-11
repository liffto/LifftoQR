from app.repositories.location_repository import LocationRepository
from app.schemas.location import LocationCreate, LocationItemResponse, LocationUpdate


class LocationService:
    def __init__(self, repository: LocationRepository) -> None:
        self.repository = repository

    def create_location(self, payload: LocationCreate) -> LocationItemResponse:
        qr = self.repository.create(payload)
        return LocationItemResponse.from_qr(qr)

    def get_location(self, qr_id: int) -> LocationItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return LocationItemResponse.from_qr(qr)

    def list_locations(self) -> list[LocationItemResponse]:
        qrs = self.repository.list_all()
        return [LocationItemResponse.from_qr(qr) for qr in qrs]

    def update_location(self, qr_id: int, payload: LocationUpdate) -> LocationItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return LocationItemResponse.from_qr(qr)

    def delete_location(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
