from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class LinkTree(Base):
    __tablename__ = "link_trees"

    id = Column(Integer, primary_key=True, index=True)
    qr_id = Column(
        Integer,
        ForeignKey("qrs.id", ondelete="CASCADE"),
        nullable=False,
        unique=True,
        index=True,
    )
    title = Column(String(255), nullable=False)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    qr = relationship("QR", back_populates="link_tree")
    links = relationship(
        "LinkTreeLink",
        back_populates="link_tree",
        cascade="delete, delete-orphan",
    )
