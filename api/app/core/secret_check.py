"""Refuse to serve production with a JWT secret anyone could guess.

The secret signs every access and refresh token, so a weak or shared value is
not a hardening nit — it is a full authentication bypass. Anyone who knows the
value can mint a token for any user id and the API will accept it. The default
in settings and the value that shipped locally were both placeholders, and a
placeholder in production means every account is forgeable.

So, in production, the app refuses to boot on a secret that is a known
placeholder or too short to be one. The same idea as the schema check: fail
loudly at startup rather than quietly serving something broken.

Deliberately scoped to production. Local development and CI both run with
`environment == "development"` (the default) and a throwaway secret, and
blocking those would only get in the way. The guard therefore only bites when
the app is explicitly told it is production — which is why production must set
`ENVIRONMENT=production`. Absent that it fails open, exactly as before, so this
can never be the thing that takes production down by surprise; the real fix is
always a strong secret.
"""

from __future__ import annotations

import logging

from app.config.settings import settings

log = logging.getLogger(__name__)

# Values that must never sign a real token. The two that actually shipped, plus
# the obvious neighbours, so a lazy "fix" to another weak value is caught too.
_KNOWN_WEAK = frozenset(
    {
        "",
        "changeme-in-production-use-env-var",
        "super-secure-secret-key",
        "secret",
        "changeme",
        "your-secret-key",
        "ci-only-not-a-real-secret",
    }
)

# HS256 keys below this are brute-forceable; the JWT library itself warns under
# 32 bytes. A urlsafe token of 32+ bytes clears this comfortably.
_MIN_LENGTH = 32


class WeakJWTSecretError(RuntimeError):
    """Production is running on a guessable JWT secret."""


def _is_weak(secret: str) -> bool:
    return secret.strip() in _KNOWN_WEAK or len(secret) < _MIN_LENGTH


def verify_jwt_secret_is_strong() -> None:
    """Raise WeakJWTSecretError if production has a weak JWT secret."""
    secret = settings.jwt_secret_key or ""
    if not _is_weak(secret):
        return

    if settings.environment.strip().lower() != "production":
        # Local / CI: a throwaway secret is expected. Say so once at debug
        # level rather than blocking work.
        log.debug(
            "JWT secret is weak, allowed because environment=%r is not production",
            settings.environment,
        )
        return

    raise WeakJWTSecretError(
        "JWT_SECRET_KEY is weak or a placeholder, and this is production. Every "
        "token it signs would be forgeable. Set JWT_SECRET_KEY to a strong "
        "random value (e.g. `python -c \"import secrets; "
        "print(secrets.token_urlsafe(48))\"`) in the API's environment and "
        "redeploy. Rotating it signs everyone out, which is the intended effect "
        "— it also invalidates any tokens forged against the old value."
    )
