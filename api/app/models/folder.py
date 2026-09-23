from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import relationship

from app.db.base_class import Base


class Folder(Base):
    """A named group a person files their codes into.

    A real row rather than a string on the QR, because a folder has to be able
    to exist while empty — people make one before they have anything to put in
    it, and a name that only exists as a column value on some other table
    vanishes the moment the last code leaves it. Renaming is then one update
    here instead of a sweep across every code that mentioned the old name.

    Deleting a folder must never take codes with it: the foreign key on
    qrs.folder_id is ON DELETE SET NULL, so the codes survive and simply become
    unfiled. Deleting a *user* does take their folders (CASCADE below).
    """

    __tablename__ = "folders"
    __table_args__ = (
        # Two folders with the same name in one account would be
        # indistinguishable in the picker, and "move to Marketing" would stop
        # having one answer.
        UniqueConstraint("user_id", "name", name="uq_folders_user_id_name"),
    )

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(100), nullable=False)

    created_at = Column(DateTime, server_default=func.now(), nullable=False)
    updated_at = Column(
        DateTime,
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    # No cascade: the codes outlive the folder. See the class docstring.
    qrs = relationship("QR", back_populates="folder_ref")
