from fastapi import HTTPException, status
from fastapi.responses import RedirectResponse

from app.services.qr_destination import landing_page_url
from app.services.scan_service import ScanService
from app.services.ws_manager import ConnectionManager, manager


class ScanController:
    def __init__(
        self,
        service: ScanService,
        ws_manager: ConnectionManager = manager,
    ) -> None:
        self.service = service
        self.ws_manager = ws_manager

    async def scan(
        self, slug: str, request_host: str | None = None
    ) -> RedirectResponse:
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

        # Types that carry a link (website, PDF, social…) redirect straight to
        # it. Everything else — a contact card, Wi-Fi credentials, an event —
        # has no destination to send the scanner to, so it lands on our own
        # branded page, which renders the content and offers the native action
        # (Save Contact, Add to Calendar, …).
        destination = self.service.resolve_destination(qr) or landing_page_url(
            slug, request_host=request_host
        )

        if qr.dynamic:
            new_scans = self.service.record_scan(slug)
            self.service.notify_owner(qr)
            if new_scans is not None:
                await self.ws_manager.broadcast(
                    slug,
                    {
                        "event": "scan_count_updated",
                        "slug": slug,
                        "scan_count": new_scans,
                    },
                )

        return RedirectResponse(url=destination, status_code=status.HTTP_302_FOUND)
