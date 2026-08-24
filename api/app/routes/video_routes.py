from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.video_controller import VideoController
from app.dependencies.dependencies import get_video_controller
from app.schemas.video import VideoCreate, VideoUpdate


router = APIRouter(
    prefix="/videos",
    tags=["videos"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_video(
    payload: VideoCreate,
    request: Request,
    controller: VideoController = Depends(get_video_controller),
) -> JSONResponse:
    return controller.create_video(payload, request.state.user)


@router.get("")
def list_videos(
    controller: VideoController = Depends(get_video_controller),
) -> JSONResponse:
    return controller.list_videos()


@router.get("/{video_id}")
def get_video(
    video_id: int,
    controller: VideoController = Depends(get_video_controller),
) -> JSONResponse:
    return controller.get_video(video_id)


@router.put("/{video_id}")
def update_video(
    video_id: int,
    payload: VideoUpdate,
    request: Request,
    controller: VideoController = Depends(get_video_controller),
) -> JSONResponse:
    return controller.update_video(video_id, payload, request.state.user)


@router.delete("/{video_id}")
def delete_video(
    video_id: int,
    controller: VideoController = Depends(get_video_controller),
) -> JSONResponse:
    return controller.delete_video(video_id)
