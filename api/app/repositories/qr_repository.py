from sqlalchemy import distinct, func, update
from sqlalchemy.orm import Session, joinedload

from app.models import LinkTree, QR, ScanEvent


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

    def unique_scans_by_qr(self, *, created_by: int) -> dict[int, int]:
        """How many distinct devices have scanned each of this user's codes.

        One grouped query for the whole list rather than a count per row.
        Codes with no recorded scans are simply absent from the result — the
        caller treats a missing key as zero, which saves carrying a row of
        zeroes for every code that predates the scan_events table.
        """
        rows = (
            self.db.query(
                ScanEvent.qr_id,
                func.count(distinct(ScanEvent.visitor_hash)),
            )
            .join(QR, QR.id == ScanEvent.qr_id)
            .filter(QR.created_by == created_by)
            .group_by(ScanEvent.qr_id)
            .all()
        )
        return {qr_id: count for qr_id, count in rows}

    def scan_tracking_started_at(self):
        """When the first scan was recorded, or None if none has been.

        Read from the data rather than hardcoded, so the "unique scans since …"
        label cannot drift from what the table actually holds — including if
        these rows are ever purged or the table is rebuilt.
        """
        return self.db.query(func.min(ScanEvent.created_at)).scalar()

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

    def increment_scans(self, slug: str) -> int | None:
        """Atomically increment scans for dynamic QRs only; returns new count."""
        new_scans = self.db.execute(
            update(QR)
            .where(QR.slug == slug, QR.dynamic.is_(True))
            .values(scans=QR.scans + 1)
            .returning(QR.scans)
        ).scalar_one_or_none()
        self.db.commit()
        return new_scans
