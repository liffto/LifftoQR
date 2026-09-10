from sqlalchemy import Column, DateTime, ForeignKey, Integer, String, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class LinkTreeLink(Base):
    __tablename__ = "link_tree_links"

    id = Column(Integer, primary_key=True, index=True)
    link_tree_id = Column(
        Integer,
        ForeignKey("link_trees.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    label = Column(String(255), nullable=False)
    url = Column(String(1000), nullable=False)
    # A key into the frontend's fixed icon set (src/lib/linkIcons); null means
    # the generic globe. Kept short — it is a name, not an image.
    icon = Column(String(40), nullable=True)
    display_order = Column(Integer, nullable=False, default=1)

    created_by = Column(Integer, nullable=True)
    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_by = Column(Integer, nullable=True)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    link_tree = relationship("LinkTree", back_populates="links")
