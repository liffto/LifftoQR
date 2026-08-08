"""Authentication API routers."""

from __future__ import annotations

from fastapi import APIRouter, Depends, File, HTTPException, Request, Form, UploadFile, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from sqlalchemy import select
import hashlib
from jwt import InvalidTokenError, PyJWTError

from app.db.session import get_db
from app.config.settings import settings
from app.core.security import (
    CLAIM_SUB,
    CLAIM_ACC,
    CLAIM_ROLE,
    CLAIM_TYP,
    CLAIM_JTI,
    decode_jwt,
    create_jwt,
    hash_password,
)
from app.auth.models import User
from app.auth.models_extras import EmailVerification
from app.auth.schemas import (
    RegisterRequest,
    VerifyEmailRequest,
    LoginRequest,
    TokenPair,
    RefreshRequest,
    UserOut,
    ForgotPasswordRequest,
    ResetPasswordRequest,
    GoogleAuthRequest,
)
from app.auth.service import (
    authenticate_user,
    authenticate_google_user,
    issue_tokens,
    get_user_roles,
    register_user,
    verify_email,
    revoke_token,
    is_revoked,
    get_user_by_email,
)
from app.auth.avatar import save_user_avatar
from app.auth.dependencies import get_current_user, roles_required, oauth2_scheme

router = APIRouter(prefix="/auth", tags=["Auth"])


def _user_out(user: User, roles: list[str]) -> UserOut:
    return UserOut(
        id=user.id,
        email=user.email,
        first_name=user.first_name or "",
        last_name=user.last_name or "",
        account_id=user.account_id,
        roles=roles,
        is_superuser=user.is_superuser,
        picture=user.avatar_url,
    )


async def get_token_form(
    request: Request,
    grant_type: str | None = Form(None),
    username: str | None = Form(None),
    password: str | None = Form(None),
    scope: str = Form(""),
    client_id: str | None = Form(None),
    client_secret: str | None = Form(None),
) -> OAuth2PasswordRequestForm:
    """Support both form-encoded token requests and JSON payloads for Swagger."""
    if username is None and password is None and request.headers.get("content-type", "").startswith("application/json"):
        body = await request.json()
        username = body.get("username") or body.get("email")
        password = body.get("password")
        grant_type = body.get("grant_type", grant_type)
        scope = body.get("scope", scope)
        client_id = body.get("client_id", client_id)
        client_secret = body.get("client_secret", client_secret)

    if not username or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username and password are required",
        )

    return OAuth2PasswordRequestForm(
        grant_type=grant_type or "password",
        username=username,
        password=password,
        scope=scope,
        client_id=client_id,
        client_secret=client_secret,
    )


@router.post("/register", status_code=201, summary="Register a new user (tenant-aware)")
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> dict:
    """Registers a user under the given account slug and creates an email verification token."""
    try:
        user = register_user(
            db,
            email=payload.email,
            password=payload.password,
            first_name=payload.first_name,
            last_name=payload.last_name,
            account_slug=payload.account_slug,
        )
        db.commit()
    except ValueError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

    # For testing: return verification token (in real apps, email it)
    token = db.execute(
        select(EmailVerification.token).where(EmailVerification.user_id == user.id)
    ).scalar()
    return {
        "message": "Registered. Verify your email.",
        "verification_token": token,
    }


@router.post("/verify-email", summary="Verify user email with token")
def verify(req: VerifyEmailRequest, db: Session = Depends(get_db)) -> dict:
    """Verify user email with token."""
    ok = verify_email(db, req.token)
    if not ok:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid/expired token"
        )
    db.commit()
    return {"message": "Email verified"}


@router.post("/google", response_model=TokenPair, summary="Sign in with Google")
def google_login(
    payload: GoogleAuthRequest,
    db: Session = Depends(get_db),
) -> TokenPair:
    """Verify a Google ID token and issue the same JWT login response as normal auth."""
    if not settings.google_client_id:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Google sign-in is not configured on the server (missing CLIENT_ID).",
        )

    try:
        user = authenticate_google_user(db, payload.id_token)
    except ValueError as exc:
        if "not configured" in str(exc).lower():
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail=str(exc),
            ) from exc
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google sign-in token",
        ) from exc
    except InvalidTokenError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google sign-in token",
        ) from exc
    except PyJWTError as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid Google sign-in token",
        ) from exc

    roles = get_user_roles(db, user.id)
    access, refresh = issue_tokens(user, roles)
    db.commit()
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/login", response_model=TokenPair, summary="Login with email/password")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenPair:
    """Login with email and password, returns access and refresh tokens."""
    user = authenticate_user(db, payload.email, payload.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )
    roles = get_user_roles(db, user.id)
    access, refresh = issue_tokens(user, roles)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.post("/refresh", response_model=TokenPair, summary="Refresh tokens")
def refresh(req: RefreshRequest, db: Session = Depends(get_db)) -> TokenPair:
    """Issue a new access token from a valid refresh token."""
    try:
        data = decode_jwt(req.refresh_token, settings.jwt_secret_key)
        if data.get(CLAIM_TYP) != "refresh":
            raise ValueError("Not a refresh token")

        jti = data.get(CLAIM_JTI)
        if jti and is_revoked(db, jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has been revoked",
            )

        user_id = int(data[CLAIM_SUB])
        user = db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )

        roles = get_user_roles(db, user.id)
        new_access = create_jwt(
            {
                CLAIM_SUB: str(user.id),
                CLAIM_ACC: user.account_id,
                CLAIM_ROLE: roles,
                CLAIM_TYP: "access",
            },
            settings.jwt_secret_key,
            minutes=settings.access_token_expire_minutes,
        )
        return TokenPair(access_token=new_access, refresh_token=req.refresh_token)
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token",
        )


@router.post("/logout", summary="Logout (revoke current access token)")
def logout(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> dict:
    """Revokes the current access token by storing its JTI in the blocklist."""
    try:
        payload = decode_jwt(token, settings.jwt_secret_key)

        # Ensure this is an access token (not refresh)
        if payload.get(CLAIM_TYP) == "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Use an access token, not refresh",
            )

        # Prefer JTI from token; fall back to a hash if old tokens lack jti
        jti = payload.get(CLAIM_JTI)
        if not jti:
            jti = hashlib.sha256(token.encode("utf-8")).hexdigest()

        revoke_token(
            db,
            jti=jti,
            account_id=payload.get(CLAIM_ACC, 0),
            reason="logout",
            exp_ts=payload.get("exp"),
        )
        db.commit()
        return {"message": "Logged out"}
    except HTTPException:
        raise
    except Exception as e:
        print(e)
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token"
        )


@router.get("/me", response_model=UserOut, summary="Current authenticated user")
def me(user=Depends(get_current_user), db: Session = Depends(get_db)) -> UserOut:
    """Get current authenticated user info."""
    roles = get_user_roles(db, user.id)
    return _user_out(user, roles)


@router.post("/me/avatar", response_model=UserOut, summary="Upload profile photo")
async def upload_avatar(
    file: UploadFile = File(...),
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserOut:
    """Upload or replace the current user's profile photo."""
    avatar_url = await save_user_avatar(user.id, file)
    user.avatar_url = avatar_url
    db.commit()
    db.refresh(user)
    roles = get_user_roles(db, user.id)
    return _user_out(user, roles)


@router.post("/token", response_model=TokenPair, summary="OAuth2 password flow (Swagger)")
def login_token(
    form: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
) -> TokenPair:
    """OAuth2 Password Grant endpoint for Swagger 'Authorize' button."""
    user = authenticate_user(db, form.username, form.password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    roles = get_user_roles(db, user.id)
    access, refresh = issue_tokens(user, roles)
    return TokenPair(access_token=access, refresh_token=refresh)


@router.get(
    "/admin/ping",
    summary="Admin-only ping",
    dependencies=[Depends(roles_required("Administrator"))],
)
def admin_ping() -> dict:
    """Admin-only endpoint for testing."""
    return {"ok": True}


@router.post("/forgot-password", summary="Request password reset")
def forgot_password(
    payload: ForgotPasswordRequest, db: Session = Depends(get_db)
) -> dict:
    """Initiates password reset flow."""
    user = get_user_by_email(db, payload.email)
    if user:
        # Generate a short-lived reset token (15 minutes)
        token_payload = {CLAIM_SUB: str(user.id), CLAIM_TYP: "reset"}
        token = create_jwt(token_payload, settings.jwt_secret_key, minutes=15)

        # In production, send via email
        # For now, return for testing
        print(f"Reset token for {payload.email}: {token}")

    return {"message": "If the email exists, a reset link has been sent."}


@router.post("/reset-password", summary="Reset password with token")
def reset_password(
    payload: ResetPasswordRequest, db: Session = Depends(get_db)
) -> dict:
    """Resets password with the provided token."""
    try:
        data = decode_jwt(payload.token, settings.jwt_secret_key)
        if data.get(CLAIM_TYP) != "reset":
            raise ValueError("Not a reset token")
        user_id = int(data[CLAIM_SUB])
        user = db.get(User, user_id)
        if not user:
            raise ValueError("User not found")
        user.password_hash = hash_password(payload.new_password)
        db.commit()
        return {"message": "Password reset successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail=str(e)
        )
