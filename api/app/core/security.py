"""Security utilities for JWT and password hashing."""

from __future__ import annotations

import jwt
from datetime import datetime, timedelta, timezone
import secrets
import hashlib
import bcrypt

# JWT claim names
CLAIM_SUB = "sub"  # subject (user_id)
CLAIM_ACC = "acc"  # account_id
CLAIM_ROLE = "role"  # list of roles
CLAIM_TYP = "typ"  # token type (access/refresh/reset)
CLAIM_JTI = "jti"  # JWT ID (for revocation)
CLAIM_EXP = "exp"  # expiration
CLAIM_IAT = "iat"  # issued at

def hash_password(plain: str) -> str:
    """Hash a plaintext password using bcrypt over a SHA-256 digest."""
    password_bytes = plain.encode("utf-8")
    digest = hashlib.sha256(password_bytes).digest()
    return bcrypt.hashpw(digest, bcrypt.gensalt(rounds=12)).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    """Verify plaintext password against hashed."""
    password_bytes = plain.encode("utf-8")
    digest = hashlib.sha256(password_bytes).digest()
    return bcrypt.checkpw(digest, hashed.encode("utf-8"))


def create_jwt(payload: dict, secret: str, minutes: int = 30) -> str:
    """Create a JWT token with standard claims."""
    now = datetime.now(timezone.utc)
    exp = now + timedelta(minutes=minutes)
    
    # Add standard claims
    payload[CLAIM_IAT] = int(now.timestamp())
    payload[CLAIM_EXP] = int(exp.timestamp())
    payload[CLAIM_JTI] = secrets.token_hex(16)
    
    return jwt.encode(payload, secret, algorithm="HS256")


def decode_jwt(token: str, secret: str) -> dict:
    """Decode and validate JWT token."""
    return jwt.decode(token, secret, algorithms=["HS256"])
