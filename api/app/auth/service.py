"""Authentication service layer."""

from __future__ import annotations

from typing import Any, Optional, Tuple, List
from datetime import datetime, timezone, timedelta
import ssl
import certifi

from sqlalchemy.orm import Session
from sqlalchemy import select, join
import jwt
from jwt import InvalidTokenError, PyJWKClient

from app.config.settings import settings
from app.core.security import (
    create_jwt,
    verify_password,
    hash_password,
    CLAIM_SUB,
    CLAIM_ACC,
    CLAIM_ROLE,
    CLAIM_TYP,
    decode_jwt,
)
from app.auth.models import User
from app.auth.models_extras import EmailVerification, TokenBlocklist
from app.rbac.models import Role, UserRole
from app.tenants.models import Account


def verify_google_id_token(id_token: str) -> dict[str, Any]:
    """Verify a Google-issued ID token using Google's public JWKS."""
    if not settings.google_client_id:
        raise ValueError("Google client ID is not configured")

    ssl_ctx = ssl.create_default_context(cafile=certifi.where())
    jwk_client = PyJWKClient("https://www.googleapis.com/oauth2/v3/certs", ssl_context=ssl_ctx)
    signing_key = jwk_client.get_signing_key_from_jwt(id_token)

    payload = jwt.decode(
        id_token,
        signing_key.key,
        algorithms=["RS256"],
        audience=settings.google_client_id,
        issuer=["accounts.google.com", "https://accounts.google.com"],
        leeway=timedelta(seconds=30),
        options={
            "verify_signature": True,
            "verify_aud": True,
            "verify_exp": True,
            "verify_iat": True,
            "verify_iss": True,
        },
    )

    if not payload.get("sub") or not payload.get("email"):
        raise ValueError("Google ID token is missing required identity claims")

    return payload


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """Get a user by email."""
    return db.execute(select(User).where(User.email == email)).scalars().first()


def get_user_roles(db: Session, user_id: int) -> List[str]:
    """Get all roles for a user."""
    j = join(UserRole, Role)
    stmt = select(Role.name).select_from(j).where(UserRole.user_id == user_id)
    return db.execute(stmt).scalars().all()


def find_account_id(db: Session, slug: str) -> Optional[int]:
    """Find account ID by slug."""
    account = db.execute(
        select(Account.id).where(Account.slug == slug)
    ).scalars().first()
    return account


def get_or_create_account(db: Session, slug: str = "default") -> Account:
    """Find or create an account for the given slug."""
    account = db.execute(select(Account).where(Account.slug == slug)).scalars().first()
    if account:
        return account

    account = Account(name=slug, slug=slug)
    db.add(account)
    db.flush()
    return account


def authenticate_google_user(
    db: Session,
    id_token: str,
    account_slug: str = "default",
) -> User:
    """Authenticate a user via Google ID token and create/update their record."""
    payload = verify_google_id_token(id_token)
    google_id = payload.get("sub")
    email = payload.get("email")
    first_name = payload.get("given_name") or ""
    last_name = payload.get("family_name") or ""
    avatar_url = payload.get("picture")
    email_verified = bool(payload.get("email_verified", False))

    if not google_id or not email:
        raise ValueError("Google ID token did not include a valid email identity")

    account = get_or_create_account(db, account_slug)

    user = db.execute(select(User).where(User.google_id == google_id)).scalars().first()
    if not user:
        user = db.execute(
            select(User).where((User.email == email) & (User.account_id == account.id))
        ).scalars().first()

    if not user:
        user = User(
            email=email,
            first_name=first_name,
            last_name=last_name,
            account_id=account.id,
            is_active=True,
            google_id=google_id,
            auth_provider="google",
            avatar_url=avatar_url,
            email_verified=email_verified,
        )
        db.add(user)
        db.flush()
    else:
        user.email = email
        user.first_name = first_name or user.first_name or ""
        user.last_name = last_name or user.last_name or ""
        user.google_id = google_id
        user.auth_provider = "google"
        user.avatar_url = avatar_url or user.avatar_url
        user.email_verified = email_verified or user.email_verified

    user.last_login_at = datetime.now(timezone.utc)
    if not user.is_active:
        raise ValueError("User account is disabled")

    return user


def register_user(
    db: Session,
    email: str,
    password: str,
    first_name: str,
    last_name: str,
    account_slug: str = "default",
) -> User:
    """Register a new user."""
    # Find or create account
    account = db.execute(
        select(Account).where(Account.slug == account_slug)
    ).scalars().first()
    
    if not account:
        account = Account(name=account_slug, slug=account_slug)
        db.add(account)
        db.flush()
    
    # Check if email exists in this account
    existing = db.execute(
        select(User).where(
            (User.email == email) & (User.account_id == account.id)
        )
    ).scalars().first()
    
    if existing:
        raise ValueError(f"Email already exists in account {account_slug}")
    
    # Create user
    user = User(
        email=email,
        password_hash=hash_password(password),
        first_name=first_name,
        last_name=last_name,
        account_id=account.id,
        is_active=True,
    )
    db.add(user)
    db.flush()
    
    # Create email verification token
    verification = EmailVerification(
        user_id=user.id,
        account_id=account.id,
        token=EmailVerification.new_token(),
        expires_at=EmailVerification.default_expiry(minutes=24 * 60),
    )
    db.add(verification)
    
    return user


def verify_email(db: Session, token_str: str) -> bool:
    """Verify email with token."""
    now = datetime.now(timezone.utc)
    token = db.execute(
        select(EmailVerification).where(
            (EmailVerification.token == token_str) & 
            (EmailVerification.expires_at > now) &
            (EmailVerification.is_used == False)
        )
    ).scalars().first()
    
    if not token:
        return False
    
    token.is_used = True
    return True


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """Authenticate user by email and password."""
    user = get_user_by_email(db, email)
    if not user or not user.is_active:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def issue_tokens(user: User, roles: List[str]) -> Tuple[str, str]:
    """Issue access and refresh tokens."""
    # Access token
    access_payload = {
        CLAIM_SUB: str(user.id),
        CLAIM_ACC: user.account_id,
        CLAIM_ROLE: roles,
        CLAIM_TYP: "access",
    }
    access_token = create_jwt(
        access_payload,
        settings.jwt_secret_key,
        minutes=settings.access_token_expire_minutes,
    )
    
    # Refresh token
    refresh_payload = {
        CLAIM_SUB: str(user.id),
        CLAIM_ACC: user.account_id,
        CLAIM_TYP: "refresh",
    }
    refresh_token = create_jwt(
        refresh_payload,
        settings.jwt_secret_key,
        minutes=settings.refresh_token_expire_minutes,
    )
    
    return access_token, refresh_token


def revoke_token(
    db: Session,
    jti: str,
    account_id: int,
    reason: str = "",
    exp_ts: Optional[int] = None,
) -> None:
    """Revoke a token by adding to blocklist."""
    from datetime import datetime, timezone, timedelta
    
    if exp_ts:
        expires = datetime.fromtimestamp(exp_ts, tz=timezone.utc)
    else:
        expires = datetime.now(timezone.utc) + timedelta(hours=1)
    
    blocklist = TokenBlocklist(
        jti=jti,
        account_id=account_id,
        reason=reason,
        expires_at=expires,
    )
    db.add(blocklist)


def is_revoked(db: Session, jti: str) -> bool:
    """Check if token is revoked."""
    now = datetime.now(timezone.utc)
    blocklist = db.execute(
        select(TokenBlocklist).where(
            (TokenBlocklist.jti == jti) & (TokenBlocklist.expires_at > now)
        )
    ).scalars().first()
    return blocklist is not None
