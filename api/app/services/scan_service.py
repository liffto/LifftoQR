from app.models.qr import QR
from app.repositories.qr_repository import QrRepository
from app.services.qr_destination import resolve_destination_url


class ScanService:
    def __init__(self, repository: QrRepository) -> None:
        self.repository = repository

    def get_qr_by_slug(self, slug: str) -> QR | None:
        return self.repository.get_by_slug(slug)

    def resolve_destination(self, qr: QR) -> str | None:
        return resolve_destination_url(qr)

    def record_scan(self, slug: str) -> int | None:
        """Increment scan count for dynamic QRs only; returns new count."""
        return self.repository.increment_scans(slug)
