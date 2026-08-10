from typing import Any

from app.models.qr import QR
from app.repositories.qr_repository import QrRepository
from app.services.qr_destination import resolve_destination_url
from app.services.qr_service import TYPE_MAPPERS


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
