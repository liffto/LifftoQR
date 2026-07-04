from app.repositories.user_repository import UserRepository
from app.schemas.user import UserCreate, UserResponse


class UserService:
    def __init__(self, repository: UserRepository) -> None:
        self.repository = repository

    async def create_user(self, payload: UserCreate) -> UserResponse:
        if "@" not in payload.email:
            raise ValueError("Email address must be valid")
        return self.repository.create_user(payload)
