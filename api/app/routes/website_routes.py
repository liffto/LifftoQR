from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.website_controller import WebsiteController
from app.dependencies.dependencies import get_website_controller
from app.schemas.website import WebsiteCreate, WebsiteUpdate


router = APIRouter(
    prefix="/websites",
    tags=["websites"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_website(
    payload: WebsiteCreate,
    request: Request,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return await controller.create_website(payload, request.state.user)


@router.get("")
async def list_websites(
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return await controller.list_websites()


@router.get("/{website_id}")
async def get_website(
    website_id: int,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return await controller.get_website(website_id)


@router.put("/{website_id}")
async def update_website(
    website_id: int,
    payload: WebsiteUpdate,
    request: Request,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return await controller.update_website(website_id, payload, request.state.user)


@router.delete("/{website_id}")
async def delete_website(
    website_id: int,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return await controller.delete_website(website_id)
