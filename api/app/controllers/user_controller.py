from fastapi.responses import JSONResponse

from app.schemas.user import UserCreate
from app.serializers.response_serializer import success_response
from app.services.user_service import UserService


class UserController:
    def __init__(self, service: UserService) -> None:
        self.service = service

    def create_user(self, payload: UserCreate) -> JSONResponse:
        user = self.service.create_user(payload)
        return JSONResponse(status_code=201, content=success_response(user.model_dump()))
