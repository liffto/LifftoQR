from fastapi import APIRouter, Depends

from app.controllers.scan_controller import ScanController
from app.dependencies.dependencies import get_scan_controller

router = APIRouter(tags=["scan"])


@router.get("/{slug}")
async def scan_qr(
    slug: str,
    controller: ScanController = Depends(get_scan_controller),
):
    return await controller.scan(slug)
