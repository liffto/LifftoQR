from fastapi import APIRouter, Depends, Response
from fastapi.responses import JSONResponse

from app.controllers.public_controller import PublicController
from app.dependencies.dependencies import get_public_controller

router = APIRouter(prefix="/public", tags=["public"])


@router.get("/qrs/{slug}")
async def get_public_qr(
    slug: str,
    controller: PublicController = Depends(get_public_controller),
) -> JSONResponse:
    return await controller.get_content(slug)


@router.get("/qrs/{slug}/contact.vcf")
async def get_public_vcard(
    slug: str,
    controller: PublicController = Depends(get_public_controller),
) -> Response:
    return await controller.get_vcard_file(slug)
