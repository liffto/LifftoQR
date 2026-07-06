from fastapi import Depends
from sqlalchemy.orm import Session

from app.controllers.user_controller import UserController
from app.controllers.website_controller import WebsiteController
from app.db.session import get_db
from app.repositories.user_repository import UserRepository
from app.repositories.website_repository import WebsiteRepository
from app.services.user_service import UserService
from app.services.website_service import WebsiteService


def get_user_controller() -> UserController:
    return UserController(UserService(UserRepository()))


def get_website_controller(db: Session = Depends(get_db)) -> WebsiteController:
    return WebsiteController(WebsiteService(WebsiteRepository(db)))
