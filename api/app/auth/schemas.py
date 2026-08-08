"""Authentication request and response schemas."""

from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import List, Optional


class RegisterRequest(BaseModel):
    """Registration request."""
    email: EmailStr
    password: str = Field(min_length=6)
    first_name: str
    last_name: str
    account_slug: str = "default"


class LoginRequest(BaseModel):
    """Login request."""
    email: EmailStr
    password: str


class TokenPair(BaseModel):
    """Token pair response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str


class GoogleAuthRequest(BaseModel):
    """Google ID token request."""
    id_token: str


class AvatarUploadRequest(BaseModel):
    """Compressed profile photo as a data URL (same format as QR logo uploads)."""

    picture: str = Field(min_length=1, max_length=2_000_000)


class UserOut(BaseModel):
    """User response model."""
    id: int
    email: str
    first_name: str
    last_name: str
    account_id: int
    roles: List[str]
    is_superuser: bool
    picture: Optional[str] = None


class VerifyEmailRequest(BaseModel):
    """Email verification request."""
    token: str


class ForgotPasswordRequest(BaseModel):
    """Forgot password request."""
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    """Reset password request."""
    token: str
    new_password: str = Field(min_length=6)


# Legacy schemas for backward compatibility
class UserCreate(BaseModel):
    """User creation schema."""
    email: str
    password: str


class UserResponse(BaseModel):
    """User response schema."""
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    email: str
