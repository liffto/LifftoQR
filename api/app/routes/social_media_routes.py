from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.social_media_controller import SocialMediaController
from app.dependencies.dependencies import get_social_media_controller
from app.schemas.social_media import SocialMediaCreate, SocialMediaUpdate


router = APIRouter(
    prefix="/social-media",
    tags=["social-media"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_social_media(
    payload: SocialMediaCreate,
    request: Request,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return controller.create_social_media(payload, request.state.user)


@router.get("")
def list_social_media(
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return controller.list_social_media()


@router.get("/{social_media_id}")
def get_social_media(
    social_media_id: int,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return controller.get_social_media(social_media_id)


@router.put("/{social_media_id}")
def update_social_media(
    social_media_id: int,
    payload: SocialMediaUpdate,
    request: Request,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return controller.update_social_media(social_media_id, payload, request.state.user)


@router.delete("/{social_media_id}")
def delete_social_media(
    social_media_id: int,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return controller.delete_social_media(social_media_id)
