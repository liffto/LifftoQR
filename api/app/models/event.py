from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Text as SqlText, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    title = Column(String(255), nullable=False)
    location = Column(String(500), nullable=True)
    start = Column(DateTime, nullable=False)
    end = Column(DateTime, nullable=False)
    all_day = Column(Boolean, nullable=False, default=False)
    description = Column(SqlText, nullable=True)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    qr = relationship("QR", back_populates="event")
