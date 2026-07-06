from sqlalchemy import Boolean, Column, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Template(Base):
    __tablename__ = "templates"

    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    logo = Column(String(500), nullable=True)
    logo_size = Column(Float, nullable=False, default=0.4)
    frame_text = Column(String(100), nullable=True)
    frame = Column(String(100), nullable=False, default="none")
    body_pattern = Column(String(100), nullable=False, default="square")
    body_gradient = Column(Boolean, nullable=False, default=False)
    body_color_1 = Column(String(20), nullable=False, default="#000000")
    body_color_2 = Column(String(20), nullable=False, default="#000000")
    corner_style = Column(Integer, nullable=False, default=0)
    corner_gradient = Column(Boolean, nullable=False, default=False)
    corner_color_1 = Column(String(20), nullable=False, default="#000000")
    corner_color_2 = Column(String(20), nullable=False, default="#000000")
    background = Column(String(20), nullable=False, default="#FFFFFF")

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    qr = relationship("QR", back_populates="template")
