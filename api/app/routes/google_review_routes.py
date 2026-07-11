from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.google_review_controller import GoogleReviewController
from app.dependencies.dependencies import get_google_review_controller
from app.schemas.google_review import GoogleReviewCreate, GoogleReviewUpdate


router = APIRouter(
    prefix="/google-reviews",
    tags=["google-reviews"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_google_review(
    payload: GoogleReviewCreate,
    request: Request,
    controller: GoogleReviewController = Depends(get_google_review_controller),
) -> JSONResponse:
    return await controller.create_google_review(payload, request.state.user)


@router.get("")
async def list_google_reviews(
    controller: GoogleReviewController = Depends(get_google_review_controller),
) -> JSONResponse:
    return await controller.list_google_reviews()


@router.get("/{google_review_id}")
async def get_google_review(
    google_review_id: int,
    controller: GoogleReviewController = Depends(get_google_review_controller),
) -> JSONResponse:
    return await controller.get_google_review(google_review_id)


@router.put("/{google_review_id}")
async def update_google_review(
    google_review_id: int,
    payload: GoogleReviewUpdate,
    request: Request,
    controller: GoogleReviewController = Depends(get_google_review_controller),
) -> JSONResponse:
    return await controller.update_google_review(google_review_id, payload, request.state.user)


@router.delete("/{google_review_id}")
async def delete_google_review(
    google_review_id: int,
    controller: GoogleReviewController = Depends(get_google_review_controller),
) -> JSONResponse:
    return await controller.delete_google_review(google_review_id)
