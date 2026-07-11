from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.video import VideoCreate, VideoUpdate
from app.serializers.response_serializer import success_response
from app.services.video_service import VideoService


class VideoController:
    def __init__(self, service: VideoService) -> None:
        self.service = service

    async def create_video(self, payload: VideoCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_video(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    async def get_video(self, video_id: int) -> JSONResponse:
        item = self.service.get_video(video_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def list_videos(self) -> JSONResponse:
        items = self.service.list_videos()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    async def update_video(
        self, video_id: int, payload: VideoUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_video(video_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def delete_video(self, video_id: int) -> JSONResponse:
        deleted = self.service.delete_video(video_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Video QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Video QR deleted successfully"})
        )
