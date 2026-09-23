from fastapi import HTTPException, status
from fastapi.responses import RedirectResponse
from starlette.concurrency import run_in_threadpool

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
        self,
        slug: str,
        request_host: str | None = None,
        client_ip: str | None = None,
        user_agent: str | None = None,
    ) -> RedirectResponse:
        # Every service call below is blocking SQLAlchemy and this handler is
        # async, which FastAPI runs on the event loop itself rather than
        # offloading the way it does a plain `def`. Called directly, one scan
        # stalls every other request in the process for the length of its
        # queries — and this is the most-hit endpoint in the product, so that
        # stall is the whole API's throughput.
        #
        # Each hop is awaited in turn, so the session is only ever touched by
        # one thread at a time, and the writes go in a single hop rather than
        # three.
        qr = await run_in_threadpool(self.service.get_qr_by_slug, slug)
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

        destination = await run_in_threadpool(
            self._destination, qr, slug, request_host
        )

        new_scans = None
        if qr.dynamic:
            new_scans = await run_in_threadpool(
                self._record_scan, qr, slug, client_ip, user_agent
            )

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

    def _destination(self, qr, slug: str, request_host: str | None) -> str:
        """Where this scan should land.

        Types that carry a link (website, PDF, social…) redirect straight to
        it. Everything else — a contact card, Wi-Fi credentials, an event — has
        no destination to send the scanner to, so it lands on our own branded
        page, which renders the content and offers the native action (Save
        Contact, Add to Calendar, …).
        """
        return self.service.resolve_destination(qr) or landing_page_url(
            slug, request_host=request_host
        )

    def _record_scan(
        self, qr, slug: str, client_ip: str | None, user_agent: str | None
    ) -> int | None:
        """The three writes a counted scan makes, in one trip off the loop."""
        new_scans = self.service.record_scan(slug)
        self.service.record_scan_event(qr, ip=client_ip, user_agent=user_agent)
        self.service.notify_owner(qr)
        return new_scans
