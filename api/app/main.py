from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.requests import Request

from sqlalchemy.exc import IntegrityError

from app.config.settings import settings
from app.core.exceptions import (
    integrity_error_handler,
    slug_already_exists_handler,
    value_error_handler,
)
from app.repositories.qr_slug import SlugAlreadyExistsError
from app.routes.health import router as health_router
from app.routes.user_routes import router as user_router
from app.api.v1 import api_v1

app = FastAPI(title=settings.app_name, version="0.1.0", debug=settings.debug)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router)
app.include_router(user_router)
app.include_router(api_v1, prefix="/api/v1")

app.add_exception_handler(ValueError, value_error_handler)
app.add_exception_handler(SlugAlreadyExistsError, slug_already_exists_handler)
app.add_exception_handler(IntegrityError, integrity_error_handler)


@app.get("/", include_in_schema=False)
async def root() -> JSONResponse:
    return JSONResponse(status_code=200, content={"message": "API is running"})
