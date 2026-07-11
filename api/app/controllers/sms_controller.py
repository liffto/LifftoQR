from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.sms import SmsCreate, SmsUpdate
from app.serializers.response_serializer import success_response
from app.services.sms_service import SmsService


class SmsController:
    def __init__(self, service: SmsService) -> None:
        self.service = service

    async def create_sms(self, payload: SmsCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        sms = self.service.create_sms(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(sms.model_dump(mode="json", by_alias=True)),
        )

    async def get_sms(self, sms_id: int) -> JSONResponse:
        sms = self.service.get_sms(sms_id)
        if sms is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SMS QR not found",
            )
        return JSONResponse(content=success_response(sms.model_dump(mode="json", by_alias=True)))

    async def list_sms(self) -> JSONResponse:
        sms_list = self.service.list_sms()
        return JSONResponse(
            content=success_response(
                [sms.model_dump(mode="json", by_alias=True) for sms in sms_list]
            )
        )

    async def update_sms(
        self, sms_id: int, payload: SmsUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        sms = self.service.update_sms(sms_id, payload)
        if sms is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SMS QR not found",
            )
        return JSONResponse(content=success_response(sms.model_dump(mode="json", by_alias=True)))

    async def delete_sms(self, sms_id: int) -> JSONResponse:
        deleted = self.service.delete_sms(sms_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="SMS QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "SMS QR deleted successfully"})
        )
