from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.phone import PhoneCreate, PhoneUpdate
from app.serializers.response_serializer import success_response
from app.services.phone_service import PhoneService


class PhoneController:
    def __init__(self, service: PhoneService) -> None:
        self.service = service

    async def create_phone(self, payload: PhoneCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        phone = self.service.create_phone(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(phone.model_dump(mode="json", by_alias=True)),
        )

    async def get_phone(self, phone_id: int) -> JSONResponse:
        phone = self.service.get_phone(phone_id)
        if phone is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phone QR not found",
            )
        return JSONResponse(content=success_response(phone.model_dump(mode="json", by_alias=True)))

    async def list_phones(self) -> JSONResponse:
        phones = self.service.list_phones()
        return JSONResponse(
            content=success_response(
                [phone.model_dump(mode="json", by_alias=True) for phone in phones]
            )
        )

    async def update_phone(
        self, phone_id: int, payload: PhoneUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        phone = self.service.update_phone(phone_id, payload)
        if phone is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phone QR not found",
            )
        return JSONResponse(content=success_response(phone.model_dump(mode="json", by_alias=True)))

    async def delete_phone(self, phone_id: int) -> JSONResponse:
        deleted = self.service.delete_phone(phone_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Phone QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Phone QR deleted successfully"})
        )
