from sqlalchemy import update
from sqlalchemy.orm import Session, joinedload

from app.models import LinkTree, QR


class QrRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def _with_content_options(self, query):
        return query.options(
            joinedload(QR.template),
            joinedload(QR.website),
            joinedload(QR.text),
            joinedload(QR.wifi),
            joinedload(QR.vcard),
            joinedload(QR.email),
            joinedload(QR.sms),
            joinedload(QR.phone),
            joinedload(QR.whatsapp),
            joinedload(QR.event),
            joinedload(QR.location),
            joinedload(QR.social_media),
            joinedload(QR.google_review),
            joinedload(QR.pdf),
            joinedload(QR.video),
            joinedload(QR.audio),
            joinedload(QR.app),
            joinedload(QR.link_tree).joinedload(LinkTree.links),
            joinedload(QR.coupon),
            joinedload(QR.invitation),
            joinedload(QR.feedback),
        )

    def list_all(self, *, created_by: int) -> list[QR]:
        return (
            self._with_content_options(self.db.query(QR))
            .filter(QR.created_by == created_by)
            .order_by(QR.id.desc())
            .all()
        )

    def get_by_id(self, qr_id: int, *, created_by: int) -> QR | None:
        return (
            self._with_content_options(self.db.query(QR))
            .filter(QR.id == qr_id, QR.created_by == created_by)
            .first()
        )

    def delete(self, qr_id: int, *, created_by: int) -> bool:
        qr = self.get_by_id(qr_id, created_by=created_by)
        if qr is None:
            return False
        self.db.delete(qr)
        self.db.commit()
        return True

    def get_by_slug(self, slug: str) -> QR | None:
        return (
            self._with_content_options(self.db.query(QR))
            .filter(QR.slug == slug)
            .first()
        )

    def increment_scans(self, slug: str) -> int:
        """Atomically increment scans for dynamic QRs only."""
        result = self.db.execute(
            update(QR)
            .where(QR.slug == slug, QR.dynamic.is_(True))
            .values(scans=QR.scans + 1)
        )
        self.db.commit()
        return result.rowcount
