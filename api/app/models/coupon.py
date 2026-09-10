from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, String, Text as SqlText, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Coupon(Base):
    __tablename__ = "coupons"

    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    title = Column(String(255), nullable=False)
    code = Column(String(100), nullable=False)
    expiry = Column(Date, nullable=True)
    description = Column(SqlText, nullable=True)
    url = Column(String(1000), nullable=True)
    # A brand mark for the coupon page, stored as a compressed image data URL —
    # hence Text, not a short String. Optional; the page falls back to the
    # ticket glyph when it is absent.
    logo = Column(SqlText, nullable=True)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    qr = relationship("QR", back_populates="coupon")
