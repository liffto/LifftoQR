from fastapi import Request
from fastapi.responses import JSONResponse
from sqlalchemy.exc import IntegrityError

from app.repositories.qr_slug import SlugAlreadyExistsError


async def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"success": False, "error": str(exc)})


async def slug_already_exists_handler(
    request: Request, exc: SlugAlreadyExistsError
) -> JSONResponse:
    return JSONResponse(
        status_code=409,
        content={"success": False, "error": str(exc)},
    )


async def integrity_error_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    error_text = str(exc.orig) if exc.orig is not None else str(exc)
    if "uq_qrs_slug" in error_text or "(slug)=" in error_text:
        return JSONResponse(
            status_code=409,
            content={
                "success": False,
                "error": "This slug is already in use. Please choose a different slug.",
            },
        )
    return JSONResponse(
        status_code=409,
        content={"success": False, "error": "A database constraint was violated."},
    )
