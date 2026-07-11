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
async def create_social_media(
    payload: SocialMediaCreate,
    request: Request,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return await controller.create_social_media(payload, request.state.user)


@router.get("")
async def list_social_media(
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return await controller.list_social_media()


@router.get("/{social_media_id}")
async def get_social_media(
    social_media_id: int,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return await controller.get_social_media(social_media_id)


@router.put("/{social_media_id}")
async def update_social_media(
    social_media_id: int,
    payload: SocialMediaUpdate,
    request: Request,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return await controller.update_social_media(social_media_id, payload, request.state.user)


@router.delete("/{social_media_id}")
async def delete_social_media(
    social_media_id: int,
    controller: SocialMediaController = Depends(get_social_media_controller),
) -> JSONResponse:
    return await controller.delete_social_media(social_media_id)
