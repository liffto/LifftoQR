"""Authentication dependencies for FastAPI."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Optional, List
from functools import wraps

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.config.settings import settings
from app.core.security import decode_jwt, CLAIM_SUB, CLAIM_ACC, CLAIM_ROLE, CLAIM_TYP, CLAIM_JTI
from app.auth.models import User
from app.auth.service import is_revoked, get_user_roles

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/token")


@dataclass
class AuthContext:
    """Authentication context with user, roles, and account info."""
    user: User
    user_id: int
    account_id: int
    roles: List[str]
    jti: str


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    """Extract and validate current user from JWT token."""
    try:
        payload = decode_jwt(token, settings.jwt_secret_key)
        
        # Check token type
        if payload.get(CLAIM_TYP) != "access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not an access token",
            )
        
        user_id = int(payload.get(CLAIM_SUB, 0))
        if not user_id:
            raise ValueError("Invalid subject claim")
        
        # Check if revoked
        jti = payload.get(CLAIM_JTI)
        if jti and is_revoked(db, jti):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has been revoked",
            )
        
        # Get user
        user = db.get(User, user_id)
        if not user or not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="User not found or inactive",
            )
        
        return user
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def get_current_roles(
    token: str = Depends(oauth2_scheme),
) -> List[str]:
    """Extract roles from JWT token."""
    try:
        payload = decode_jwt(token, settings.jwt_secret_key)
        return payload.get(CLAIM_ROLE, [])
    except Exception:
        return []


def roles_required(*required_roles: str):
    """Dependency factory for role-based access control."""
    def role_checker(
        token: str = Depends(oauth2_scheme),
        db: Session = Depends(get_db),
    ) -> AuthContext:
        try:
            payload = decode_jwt(token, settings.jwt_secret_key)
            
            if payload.get(CLAIM_TYP) != "access":
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Not an access token",
                )
            
            user_id = int(payload.get(CLAIM_SUB, 0))
            account_id = payload.get(CLAIM_ACC, 0)
            jti = payload.get(CLAIM_JTI)
            
            if not user_id:
                raise ValueError("Invalid subject claim")
            
            # Check if revoked
            if jti and is_revoked(db, jti):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token revoked",
                )
            
            user = db.get(User, user_id)
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found or inactive",
                )
            
            # Get roles
            roles = get_user_roles(db, user_id)
            
            # Check required roles
            if required_roles:
                if not any(role in roles for role in required_roles):
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Insufficient permissions",
                    )
            
            return AuthContext(
                user=user,
                user_id=user_id,
                account_id=account_id,
                roles=roles,
                jti=jti,
            )
        
        except HTTPException:
            raise
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )
    
    return role_checker


def get_current_user_with_roles(
    *required_roles: str,
) -> callable:
    """Combined dependency returning AuthContext with optional role checking."""
    return roles_required(*required_roles)
