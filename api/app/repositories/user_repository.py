from dataclasses import dataclass, field

from app.schemas.user import UserCreate, UserResponse


@dataclass
class UserRepository:
    _store: dict[int, UserResponse] = field(default_factory=dict)
    _next_id: int = 1

    def create_user(self, payload: UserCreate) -> UserResponse:
        user = UserResponse(id=self._next_id, name=payload.name, email=payload.email)
        self._store[user.id] = user
        self._next_id += 1
        return user
