from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.whatsapp import WhatsappCreate, WhatsappUpdate
from app.serializers.response_serializer import success_response
from app.services.whatsapp_service import WhatsappService


class WhatsappController:
    def __init__(self, service: WhatsappService) -> None:
        self.service = service

    def create_whatsapp(self, payload: WhatsappCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        whatsapp = self.service.create_whatsapp(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(whatsapp.model_dump(mode="json", by_alias=True)),
        )

    def get_whatsapp(self, whatsapp_id: int) -> JSONResponse:
        whatsapp = self.service.get_whatsapp(whatsapp_id)
        if whatsapp is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="WhatsApp QR not found",
            )
        return JSONResponse(
            content=success_response(whatsapp.model_dump(mode="json", by_alias=True))
        )

    def list_whatsapp(self) -> JSONResponse:
        whatsapp_list = self.service.list_whatsapp()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in whatsapp_list]
            )
        )

    def update_whatsapp(
        self, whatsapp_id: int, payload: WhatsappUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        whatsapp = self.service.update_whatsapp(whatsapp_id, payload)
        if whatsapp is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="WhatsApp QR not found",
            )
        return JSONResponse(
            content=success_response(whatsapp.model_dump(mode="json", by_alias=True))
        )

    def delete_whatsapp(self, whatsapp_id: int) -> JSONResponse:
        deleted = self.service.delete_whatsapp(whatsapp_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="WhatsApp QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "WhatsApp QR deleted successfully"})
        )
