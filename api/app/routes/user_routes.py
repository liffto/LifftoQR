from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse

from app.controllers.user_controller import UserController
from app.dependencies.dependencies import get_user_controller
from app.schemas.user import UserCreate

router = APIRouter(prefix="/users", tags=["users"])


@router.post("", status_code=201)
async def create_user(
    payload: UserCreate,
    controller: UserController = Depends(get_user_controller),
) -> JSONResponse:
    return await controller.create_user(payload)
