from contextlib import asynccontextmanager
from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.staticfiles import StaticFiles
from starlette.requests import Request

from sqlalchemy.exc import IntegrityError

from app.config.settings import settings
from app.db.schema_check import verify_schema_is_current
from app.core.secret_check import verify_jwt_secret_is_strong
from app.core.observability import init_error_tracking
from app.core.exceptions import (
    integrity_error_handler,
    slug_already_exists_handler,
    value_error_handler,
)
from app.repositories.qr_slug import SlugAlreadyExistsError
from app.routes.health import router as health_router
from app.routes.scan_routes import router as scan_router
from app.routes.user_routes import router as user_router
from app.routes.ws_routes import router as ws_router
from app.api.v1 import api_v1

# Before the app, so an error raised while building it is still reported.
init_error_tracking()


@asynccontextmanager
async def lifespan(_app: FastAPI):
    """Refuse to serve in a state that is quietly broken.

    Two startup guards, both failing loudly here rather than as a mystery later:
    a schema behind the code (app/db/schema_check.py), and a weak JWT secret in
    production (app/core/secret_check.py) — a placeholder there means every
    session token is forgeable.
    """
    verify_jwt_secret_is_strong()
    verify_schema_is_current()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    debug=settings.debug,
    lifespan=lifespan,
)

UPLOADS_DIR = Path(__file__).resolve().parent.parent / "uploads"
try:
    UPLOADS_DIR.mkdir(parents=True, exist_ok=True)
    (UPLOADS_DIR / "avatars").mkdir(parents=True, exist_ok=True)
    app.mount("/api/v1/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")
except OSError:
    # Vercel serverless has a read-only filesystem — avatars use Blob storage there.
    pass

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    # Preview deployments, which are still named after the Vercel *project*
    # (liffto-web-app) even though production now serves from qr.liffto.in:
    # https://liffto-web-app-<hash>-<team>.vercel.app. The bare
    # liffto-web-app.vercel.app returns DEPLOYMENT_NOT_FOUND these days, so this
    # looks stale and is not — deleting it would break CORS on every preview.
    allow_origin_regex=r"https://liffto-web-app[\w-]*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(user_router)
app.include_router(api_v1, prefix="/api/v1")
app.include_router(ws_router)
app.include_router(scan_router)

app.add_exception_handler(ValueError, value_error_handler)
app.add_exception_handler(SlugAlreadyExistsError, slug_already_exists_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)


@app.get("/", include_in_schema=False)
async def root() -> JSONResponse:
    return JSONResponse(status_code=200, content={"message": "API is running"})
