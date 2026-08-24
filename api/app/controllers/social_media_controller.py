from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.social_media import SocialMediaCreate, SocialMediaUpdate
from app.serializers.response_serializer import success_response
from app.services.social_media_service import SocialMediaService


class SocialMediaController:
    def __init__(self, service: SocialMediaService) -> None:
        self.service = service

    def create_social_media(self, payload: SocialMediaCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_social_media(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    def get_social_media(self, social_media_id: int) -> JSONResponse:
        item = self.service.get_social_media(social_media_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Social Media QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def list_social_media(self) -> JSONResponse:
        items = self.service.list_social_media()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    def update_social_media(
        self, social_media_id: int, payload: SocialMediaUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_social_media(social_media_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Social Media QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def delete_social_media(self, social_media_id: int) -> JSONResponse:
        deleted = self.service.delete_social_media(social_media_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Social Media QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Social Media QR deleted successfully"})
        )
