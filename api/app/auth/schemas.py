"""Authentication request and response schemas."""

from __future__ import annotations

from datetime import datetime

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


class ProfileUpdateRequest(BaseModel):
    """Editable profile fields.

    Email is deliberately absent: it is the identity Google sign-in matches
    users on, so letting it be edited here would orphan the account from its
    provider and could collide with another user's address.
    """

    first_name: str = Field(min_length=1, max_length=200)
    last_name: str = Field(default="", max_length=200)
    # Empty string clears the number; otherwise E.164 as the client builds it.
    phone: str = Field(default="", max_length=20, pattern=r"^$|^\+[1-9]\d{6,14}$")


class NotificationPreferences(BaseModel):
    """Which alerts a user wants."""

    notify_scans: bool = True
    notify_weekly: bool = True
    notify_product: bool = False


class NotificationOut(BaseModel):
    """One in-app notification."""

    id: int
    kind: str
    title: str
    body: str
    qr_id: Optional[int] = None
    read: bool
    created_at: datetime
    updated_at: datetime


class DeviceOut(BaseModel):
    """A signed-in device."""

    id: int
    device_type: str
    device_name: str
    browser: Optional[str] = None
    ip_address: Optional[str] = None
    last_seen_at: datetime
    created_at: datetime
    current: bool = False


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
    phone: Optional[str] = None
    notify_scans: bool = True
    notify_weekly: bool = True
    notify_product: bool = False


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
