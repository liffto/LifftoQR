from fastapi import APIRouter, Depends, Request

from app.controllers.scan_controller import ScanController
from app.dependencies.dependencies import get_scan_controller

router = APIRouter(tags=["scan"])


@router.get("/{slug}")
async def scan_qr(
    slug: str,
    request: Request,
    controller: ScanController = Depends(get_scan_controller),
):
    # Behind Vercel's proxy the public hostname arrives in x-forwarded-host;
    # `host` is the fallback for direct/local requests.
    host = request.headers.get("x-forwarded-host") or request.headers.get("host")
    return await controller.scan(slug, request_host=host)
