from sqlalchemy import Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    lat = Column(Float, nullable=False)
    lng = Column(Float, nullable=False)
    label = Column(String(255), nullable=True)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    qr = relationship("QR", back_populates="location")
