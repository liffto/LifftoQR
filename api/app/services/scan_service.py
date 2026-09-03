from typing import Any

from app.auth.user_agent import parse_user_agent
from app.models.qr import QR
from app.models.scan_event import ScanEvent
from app.repositories.qr_repository import QrRepository
from app.services.qr_destination import resolve_destination_url
from app.services.notification_service import record_scan_notification
from app.services.qr_service import TYPE_MAPPERS
from app.services.visitor import visitor_hash


class ScanService:
    def __init__(self, repository: QrRepository) -> None:
        self.repository = repository

    def get_qr_by_slug(self, slug: str) -> QR | None:
        return self.repository.get_by_slug(slug)

    def serialize(self, qr: QR) -> dict[str, Any] | None:
        """Render a QR with the same shape the owner-facing API returns."""
        mapper = TYPE_MAPPERS.get(qr.type_key)
        if mapper is None:
            return None
        try:
            item = mapper(qr)
        except ValueError:
            return None
        return item.model_dump(mode="json", by_alias=True)

    def resolve_destination(self, qr: QR) -> str | None:
        return resolve_destination_url(qr)

    def record_scan(self, slug: str) -> int | None:
        """Increment scan count for dynamic QRs only; returns new count."""
        return self.repository.increment_scans(slug)

    def record_scan_event(
        self,
        qr: QR,
        ip: str | None = None,
        user_agent: str | None = None,
    ) -> None:
        """Log this individual scan alongside the running total.

        Every scan gets a row, repeats included — the total counts scans, and a
        unique figure comes from counting distinct visitors over these rows
        later. Best-effort in the same way as notify_owner: whoever scanned is
        owed their redirect, and losing one analytics row is a far better
        outcome than an error page.
        """
        try:
            device_type, _device_name, browser = parse_user_agent(user_agent)
            self.repository.db.add(
                ScanEvent(
                    qr_id=qr.id,
                    visitor_hash=visitor_hash(ip, user_agent),
                    device_type=device_type,
                    browser=browser,
                )
            )
            self.repository.db.commit()
        except Exception:
            self.repository.db.rollback()

    def notify_owner(self, qr: QR) -> None:
        """Best-effort in-app alert for the QR's owner.

        A scan must still redirect even if this fails, so a problem here is
        swallowed rather than turned into an error for whoever scanned.
        """
        try:
            record_scan_notification(self.repository.db, qr)
            self.repository.db.commit()
        except Exception:
            self.repository.db.rollback()
