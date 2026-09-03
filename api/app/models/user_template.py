from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    String,
    Text,
    UniqueConstraint,
    func,
)

from app.db.base_class import Base


class UserTemplate(Base):
    """A saved design a user can apply to any of their codes.

    Distinct from Template, which is the design attached to one specific QR and
    is keyed by qr_id. This one belongs to the person, not to a code, and is
    what the design studio's template picker lists.

    These lived in localStorage until now, which meant they were per-browser: a
    look saved on a laptop was invisible on a phone, and clearing site data
    threw the lot away with no warning and no copy anywhere.
    """

    __tablename__ = "user_templates"
    __table_args__ = (
        # Saving under an existing name replaces it, which is what the studio
        # has always done locally. The constraint makes that an upsert rather
        # than a slow accumulation of duplicates.
        UniqueConstraint("user_id", "label", name="uq_user_templates_user_id_label"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    label = Column(String(100), nullable=False)

    # The same design columns Template carries, so a saved look and an applied
    # one describe a code the same way.
    logo = Column(Text, nullable=True)
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

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )
