"""Unauthenticated endpoints backing the public scan landing page.

A dynamic QR whose content has no redirect target (a contact card, Wi-Fi
credentials, an event…) sends the scanner to our own landing page instead of
a destination site. That page is opened by whoever scanned the code, so these
endpoints must not require a session — they expose only what the QR itself
already encodes.
"""

from fastapi import HTTPException, Response, status
from fastapi.responses import JSONResponse

from app.serializers.response_serializer import success_response
from app.services.scan_service import ScanService
from app.services.vcard_builder import build_vcard, vcard_filename

# Fields safe to hand to an anonymous scanner: the payload the QR encodes plus
# what the page needs to render it. Owner-side metadata (scan counts, folder,
# ids) is deliberately left out.
_PUBLIC_FIELDS = ("typeKey", "type", "name", "content")


class PublicController:
    def __init__(self, service: ScanService) -> None:
        self.service = service

    def _get_active_qr(self, slug: str):
        qr = self.service.get_qr_by_slug(slug)
        if qr is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR code not found",
            )
        if not qr.status:
            raise HTTPException(
                status_code=status.HTTP_410_GONE,
                detail="This QR code is no longer active",
            )
        return qr

    def get_content(self, slug: str) -> JSONResponse:
        qr = self._get_active_qr(slug)
        item = self.service.serialize(qr)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR content is unavailable",
            )
        payload = {k: item.get(k) for k in _PUBLIC_FIELDS}
        return JSONResponse(content=success_response(payload))

    def get_vcard_file(self, slug: str) -> Response:
        qr = self._get_active_qr(slug)
        if qr.type_key != "vcard" or qr.vcard is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="This QR code is not a contact card",
            )
        return Response(
            content=build_vcard(qr.vcard),
            media_type="text/vcard; charset=utf-8",
            headers={
                # `attachment` is what makes iOS hand the file to Contacts
                # rather than rendering it as text in the browser.
                "Content-Disposition": (
                    f'attachment; filename="{vcard_filename(qr.vcard)}"'
                ),
                "Cache-Control": "no-store",
            },
        )
