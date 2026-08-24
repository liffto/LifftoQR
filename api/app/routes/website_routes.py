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
def create_website(
    payload: WebsiteCreate,
    request: Request,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return controller.create_website(payload, request.state.user)


@router.get("")
def list_websites(
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return controller.list_websites()


@router.get("/{website_id}")
def get_website(
    website_id: int,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return controller.get_website(website_id)


@router.put("/{website_id}")
def update_website(
    website_id: int,
    payload: WebsiteUpdate,
    request: Request,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return controller.update_website(website_id, payload, request.state.user)


@router.delete("/{website_id}")
def delete_website(
    website_id: int,
    controller: WebsiteController = Depends(get_website_controller),
) -> JSONResponse:
    return controller.delete_website(website_id)
