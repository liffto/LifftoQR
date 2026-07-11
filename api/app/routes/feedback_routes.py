from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.feedback_controller import FeedbackController
from app.dependencies.dependencies import get_feedback_controller
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate


router = APIRouter(
    prefix="/feedbacks",
    tags=["feedbacks"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_feedback(
    payload: FeedbackCreate,
    request: Request,
    controller: FeedbackController = Depends(get_feedback_controller),
) -> JSONResponse:
    return await controller.create_feedback(payload, request.state.user)


@router.get("")
async def list_feedbacks(
    controller: FeedbackController = Depends(get_feedback_controller),
) -> JSONResponse:
    return await controller.list_feedbacks()


@router.get("/{feedback_id}")
async def get_feedback(
    feedback_id: int,
    controller: FeedbackController = Depends(get_feedback_controller),
) -> JSONResponse:
    return await controller.get_feedback(feedback_id)


@router.put("/{feedback_id}")
async def update_feedback(
    feedback_id: int,
    payload: FeedbackUpdate,
    request: Request,
    controller: FeedbackController = Depends(get_feedback_controller),
) -> JSONResponse:
    return await controller.update_feedback(feedback_id, payload, request.state.user)


@router.delete("/{feedback_id}")
async def delete_feedback(
    feedback_id: int,
    controller: FeedbackController = Depends(get_feedback_controller),
) -> JSONResponse:
    return await controller.delete_feedback(feedback_id)
