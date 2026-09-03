"""One row per scan.

The QR's own `scans` counter stays the total and keeps incrementing on every
scan, including a repeat from the same phone a minute later — deliberately, so
"Total Scans" never quietly changes meaning. What this table adds is the
*identity* of each scan, which is what makes a separate unique count possible
later: unique scans are `COUNT(DISTINCT visitor_hash)` at read time rather than
something suppressed at write time.

`visitor_hash` is a keyed hash of the caller's IP and User-Agent, never the
address itself. A plain 302 redirect carries no device identifier, so this is
the closest stable stand-in available without setting a cookie on someone who
only came to follow a link. It is good enough to tell two phones apart and
deliberately not good enough to identify a person: the raw IP is not stored, so
the row cannot be walked back to one.
"""

from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, ForeignKey, Index, Integer, String

from app.db.base_class import Base, PKMixin


class ScanEvent(PKMixin, Base):
    """No account_id on purpose: `qrs` has none either — it scopes by
    `created_by` — so a tenant column here would have nothing to populate it
    from. A scan belongs to its QR, and the QR knows who owns it.
    """

    __tablename__ = "scan_events"

    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    # Nullable because a scan is never worth failing over: if the hash cannot
    # be built (no headers at all), the scan is still recorded, just anonymous.
    visitor_hash = Column(String(64), nullable=True, index=True)
    device_type = Column(String(20), nullable=True)
    browser = Column(String(60), nullable=True)
    created_at = Column(
        DateTime(timezone=True),
        nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )

    __table_args__ = (
        # The two questions this table exists to answer: how many unique
        # visitors has this code had, and how many scans in a given period.
        Index("ix_scan_events_qr_id_visitor_hash", "qr_id", "visitor_hash"),
        Index("ix_scan_events_qr_id_created_at", "qr_id", "created_at"),
    )
