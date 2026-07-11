from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, Text as SqlText, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Vcard(Base):
    __tablename__ = "vcards"

    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    photo = Column(SqlText, nullable=True)
    logo = Column(SqlText, nullable=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100), nullable=True)
    org = Column(String(255), nullable=True)
    title = Column(String(255), nullable=True)
    phone = Column(String(30), nullable=True)
    work_phone = Column(String(30), nullable=True)
    email = Column(String(255), nullable=True)
    url = Column(String(500), nullable=True)
    street = Column(String(255), nullable=True)
    city = Column(String(100), nullable=True)
    state = Column(String(100), nullable=True)
    zip = Column(String(20), nullable=True)
    country = Column(String(100), nullable=True)
    note = Column(SqlText, nullable=True)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    qr = relationship("QR", back_populates="vcard")
