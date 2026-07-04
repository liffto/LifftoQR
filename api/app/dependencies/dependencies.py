from app.controllers.user_controller import UserController
from app.repositories.user_repository import UserRepository
from app.services.user_service import UserService


def get_user_controller() -> UserController:
    return UserController(UserService(UserRepository()))
