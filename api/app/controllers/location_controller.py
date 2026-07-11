from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.location import LocationCreate, LocationUpdate
from app.serializers.response_serializer import success_response
from app.services.location_service import LocationService


class LocationController:
    def __init__(self, service: LocationService) -> None:
        self.service = service

    async def create_location(self, payload: LocationCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_location(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    async def get_location(self, location_id: int) -> JSONResponse:
        item = self.service.get_location(location_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def list_locations(self) -> JSONResponse:
        items = self.service.list_locations()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    async def update_location(
        self, location_id: int, payload: LocationUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_location(location_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def delete_location(self, location_id: int) -> JSONResponse:
        deleted = self.service.delete_location(location_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Location QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Location QR deleted successfully"})
        )
