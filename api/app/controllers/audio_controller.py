from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.audio import AudioCreate, AudioUpdate
from app.serializers.response_serializer import success_response
from app.services.audio_service import AudioService


class AudioController:
    def __init__(self, service: AudioService) -> None:
        self.service = service

    async def create_audio(self, payload: AudioCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_audio(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    async def get_audio(self, audio_id: int) -> JSONResponse:
        item = self.service.get_audio(audio_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def list_audios(self) -> JSONResponse:
        items = self.service.list_audios()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    async def update_audio(
        self, audio_id: int, payload: AudioUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_audio(audio_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def delete_audio(self, audio_id: int) -> JSONResponse:
        deleted = self.service.delete_audio(audio_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Audio QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Audio QR deleted successfully"})
        )
