from app.schemas.user import UserResponse


def serialize_user(user: UserResponse) -> dict[str, object]:
    return user.model_dump()
