from typing import Any, Callable

from app.models.qr import QR
from app.repositories.qr_repository import QrRepository
from app.schemas.app import AppItemResponse
from app.schemas.audio import AudioItemResponse
from app.schemas.coupon import CouponItemResponse
from app.schemas.email import EmailItemResponse
from app.schemas.event import EventItemResponse
from app.schemas.feedback import FeedbackItemResponse
from app.schemas.google_review import GoogleReviewItemResponse
from app.schemas.invitation import InvitationItemResponse
from app.schemas.link_tree import LinkTreeItemResponse
from app.schemas.location import LocationItemResponse
from app.schemas.pdf import PdfItemResponse
from app.schemas.phone import PhoneItemResponse
from app.schemas.sms import SmsItemResponse
from app.schemas.social_media import SocialMediaItemResponse
from app.schemas.text import TextItemResponse
from app.schemas.vcard import VcardItemResponse
from app.schemas.video import VideoItemResponse
from app.schemas.website import WebsiteItemResponse
from app.schemas.whatsapp import WhatsappItemResponse
from app.schemas.wifi import WifiItemResponse

QrMapper = Callable[[QR], Any]

TYPE_MAPPERS: dict[str, QrMapper] = {
    "url": WebsiteItemResponse.from_qr,
    "website": WebsiteItemResponse.from_qr,
    "text": TextItemResponse.from_qr,
    "wifi": WifiItemResponse.from_qr,
    "vcard": VcardItemResponse.from_qr,
    "email": EmailItemResponse.from_qr,
    "sms": SmsItemResponse.from_qr,
    "phone": PhoneItemResponse.from_qr,
    "whatsapp": WhatsappItemResponse.from_qr,
    "event": EventItemResponse.from_qr,
    "location": LocationItemResponse.from_qr,
    "social": SocialMediaItemResponse.from_qr,
    "google-review": GoogleReviewItemResponse.from_qr,
    "pdf": PdfItemResponse.from_qr,
    "video": VideoItemResponse.from_qr,
    "mp3": AudioItemResponse.from_qr,
    "app": AppItemResponse.from_qr,
    "linktree": LinkTreeItemResponse.from_qr,
    "coupon": CouponItemResponse.from_qr,
    "invitation": InvitationItemResponse.from_qr,
    "feedback": FeedbackItemResponse.from_qr,
}


class QrService:
    def __init__(self, repository: QrRepository) -> None:
        self.repository = repository

    def list_qrs(self, created_by: int) -> list[dict[str, Any]]:
        # Added here rather than to the thirteen per-type response schemas that
        # _map_qr goes through: uniqueScans is the same derived number for every
        # type, and threading it through each one would be thirteen chances to
        # forget it on the fourteenth.
        unique = self.repository.unique_scans_by_qr(created_by=created_by)
        items: list[dict[str, Any]] = []
        for qr in self.repository.list_all(created_by=created_by):
            mapped = self._map_qr(qr)
            if mapped is not None:
                # Absent means no scan has been recorded for this code — which
                # is every code that only ever ran before scan_events existed.
                mapped["uniqueScans"] = unique.get(qr.id, 0)
                items.append(mapped)
        return items

    def scan_tracking_started_at(self):
        return self.repository.scan_tracking_started_at()

    def get_qr(self, qr_id: int, created_by: int) -> dict[str, Any] | None:
        qr = self.repository.get_by_id(qr_id, created_by=created_by)
        if qr is None:
            return None
        return self._map_qr(qr)

    def delete_qr(self, qr_id: int, created_by: int) -> bool:
        return self.repository.delete(qr_id, created_by=created_by)

    def _map_qr(self, qr: QR) -> dict[str, Any] | None:
        mapper = TYPE_MAPPERS.get(qr.type_key)
        if mapper is None:
            return None
        try:
            item = mapper(qr)
        except ValueError:
            return None
        return item.model_dump(mode="json", by_alias=True)
