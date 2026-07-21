from fastapi import HTTPException, status
from fastapi.responses import RedirectResponse

from app.services.scan_service import ScanService


class ScanController:
    def __init__(self, service: ScanService) -> None:
        self.service = service

    async def scan(self, slug: str) -> RedirectResponse:
        qr = self.service.get_qr_by_slug(slug)
        if qr is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR code not found",
            )

        if not qr.status:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="QR code is inactive",
            )

        destination = self.service.resolve_destination(qr)
        if destination is None:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Destination URL is not available",
            )

        if qr.dynamic:
            self.service.record_scan(slug)

        return RedirectResponse(url=destination, status_code=status.HTTP_302_FOUND)
