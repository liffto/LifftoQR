from sqlalchemy import Boolean, Column, Date, DateTime, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class QR(Base):
    __tablename__ = "qrs"

    id = Column(Integer, primary_key=True, index=True)
    type_key = Column(String(100), nullable=False, index=True)
    type = Column(String(100), nullable=False)
    name = Column(String(255), nullable=False, index=True)
    url = Column(String(500), nullable=True)
    slug = Column(String(100), nullable=False, unique=True, index=True)
    dynamic = Column(Boolean, nullable=False, default=False)
    qr_type = Column(String(100), nullable=False)
    folder = Column(String(100), nullable=True)
    status = Column(Boolean, nullable=False, default=True)
    scans = Column(Integer, nullable=False, default=0)
    edited_on = Column(Date, nullable=True)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    website = relationship(
        "Website",
        back_populates="qr",
        uselist=False,
        foreign_keys="Website.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
    template = relationship(
        "Template",
        back_populates="qr",
        uselist=False,
        foreign_keys="Template.qr_id",
        cascade="delete, delete-orphan",
        single_parent=True,
    )
