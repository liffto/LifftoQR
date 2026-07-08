from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.text import TextCreate, TextUpdate
from app.serializers.response_serializer import success_response
from app.services.text_service import TextService


class TextController:
    def __init__(self, service: TextService) -> None:
        self.service = service

    async def create_text(self, payload: TextCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        text = self.service.create_text(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(text.model_dump(mode="json", by_alias=True)),
        )

    async def get_text(self, text_id: int) -> JSONResponse:
        text = self.service.get_text(text_id)
        if text is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Text QR not found",
            )
        return JSONResponse(content=success_response(text.model_dump(mode="json", by_alias=True)))

    async def list_texts(self) -> JSONResponse:
        texts = self.service.list_texts()
        return JSONResponse(
            content=success_response(
                [text.model_dump(mode="json", by_alias=True) for text in texts]
            )
        )

    async def update_text(
        self, text_id: int, payload: TextUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        text = self.service.update_text(text_id, payload)
        if text is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Text QR not found",
            )
        return JSONResponse(content=success_response(text.model_dump(mode="json", by_alias=True)))

    async def delete_text(self, text_id: int) -> JSONResponse:
        deleted = self.service.delete_text(text_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Text QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Text QR deleted successfully"})
        )
