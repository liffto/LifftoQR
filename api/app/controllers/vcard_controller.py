from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.vcard import VcardCreate, VcardUpdate
from app.serializers.response_serializer import success_response
from app.services.vcard_service import VcardService


class VcardController:
    def __init__(self, service: VcardService) -> None:
        self.service = service

    async def create_vcard(self, payload: VcardCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        vcard = self.service.create_vcard(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(vcard.model_dump(mode="json", by_alias=True)),
        )

    async def get_vcard(self, vcard_id: int) -> JSONResponse:
        vcard = self.service.get_vcard(vcard_id)
        if vcard is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact Card QR not found",
            )
        return JSONResponse(content=success_response(vcard.model_dump(mode="json", by_alias=True)))

    async def list_vcards(self) -> JSONResponse:
        vcards = self.service.list_vcards()
        return JSONResponse(
            content=success_response(
                [vcard.model_dump(mode="json", by_alias=True) for vcard in vcards]
            )
        )

    async def update_vcard(
        self, vcard_id: int, payload: VcardUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        vcard = self.service.update_vcard(vcard_id, payload)
        if vcard is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact Card QR not found",
            )
        return JSONResponse(content=success_response(vcard.model_dump(mode="json", by_alias=True)))

    async def delete_vcard(self, vcard_id: int) -> JSONResponse:
        deleted = self.service.delete_vcard(vcard_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Contact Card QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Contact Card QR deleted successfully"})
        )
