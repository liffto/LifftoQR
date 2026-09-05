from pathlib import Path

from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict

BASE_DIR = Path(__file__).resolve().parents[2]

# Canonical public origin of the web app. This is not only a CORS entry: scan
# redirects for QR types with no destination of their own (contact cards, Wi-Fi,
# events) are built from it, and that link is handed to whoever scanned the
# code. A localhost default would send every scanner to their own machine, so
# production — where FRONTEND_URL is easy to forget — must default to this.
# Local development overrides it via FRONTEND_URL in api/.env.
# PRODUCTION_APP_URL = "https://liffto-web-app.vercel.app"
PRODUCTION_APP_URL = "https://qr.liffto.in"
# Browser origins always allowed (even if FRONTEND_URL env is only localhost).
DEFAULT_CORS_ORIGINS: tuple[str, ...] = (
    "http://localhost:5173",
    "http://localhost:4173",
    PRODUCTION_APP_URL,
)


class Settings(BaseSettings):
    """Application settings loaded from environment and .env."""

    # App
    app_name: str = "QR API"
    environment: str = "development"
    debug: bool = True
    project_name: str = "QR Code Management API"

    # Database
    database_url: str

    # Security / JWT
    jwt_secret_key: str = "changeme-in-production-use-env-var"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    refresh_token_expire_minutes: int = 60 * 24 * 7  # 7 days
    token_audience: str = "qr-api"
    token_issuer: str = "qr-api-auth"

    # Google OAuth (.env may use CLIENT_ID / CLIENT_SECRET or GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET)
    google_client_id: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GOOGLE_CLIENT_ID", "CLIENT_ID"),
    )
    google_client_secret: str | None = Field(
        default=None,
        validation_alias=AliasChoices("GOOGLE_CLIENT_SECRET", "CLIENT_SECRET"),
    )
    frontend_url: str = PRODUCTION_APP_URL

    # Error tracking. Empty means off, which is what local and CI want —
    # nothing is initialised and no events leave the machine.
    sentry_dsn: str = ""
    # Fraction of requests traced for performance. Errors are always sent;
    # this is only the timing data, which is what gets expensive.
    sentry_traces_sample_rate: float = 0.0

    # Shared secret for the scheduled-maintenance endpoint. Empty means the
    # endpoint refuses to run at all, rather than running unauthenticated.
    cron_secret: str = ""

    @classmethod
    def _normalize_url(cls, value: str) -> str:
        return value.rstrip("/") if value else value

    def model_post_init(self, __context) -> None:
        self.frontend_url = self._normalize_url(self.frontend_url)

    @property
    def cors_origins(self) -> list[str]:
        """Origins allowed to call this API from a browser."""
        origins: list[str] = []
        for part in self.frontend_url.split(","):
            cleaned = self._normalize_url(part.strip())
            if cleaned and cleaned not in origins:
                origins.append(cleaned)
        for default in DEFAULT_CORS_ORIGINS:
            if default not in origins:
                origins.append(default)
        return origins

    model_config = SettingsConfigDict(
        env_file=BASE_DIR / ".env",
        env_file_encoding="utf-8",
        extra="allow",
        case_sensitive=False,
    )


settings = Settings()
