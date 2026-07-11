from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text as SqlText, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Feedback(Base):
    __tablename__ = "feedbacks"

    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    url = Column(String(1000), nullable=False)
    prefill_key = Column(String(255), nullable=True)
    prefill_value = Column(SqlText, nullable=True)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    qr = relationship("QR", back_populates="feedback")
