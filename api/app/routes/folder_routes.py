"""Folders: the groups a person files their codes into.

On the direct session pattern the saved-templates routes use rather than the
controller/service/repository stack the QR types use — this is a small
user-scoped list with no per-type behaviour behind it.

Everything here is scoped to the caller. A folder id belonging to somebody else
reads as 404, not 403: there is nothing to be learned from the difference.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.db.session import get_db
from app.models.folder import Folder
from app.models.qr import QR
from app.schemas.folder import FolderAssignment, FolderResponse, FolderSave

router = APIRouter(
    prefix="/folders",
    tags=["folders"],
    dependencies=[Depends(get_current_user)],
)


def _owned_folder(db: Session, folder_id: int, user: User) -> Folder:
    folder = db.execute(
        select(Folder).where(Folder.id == folder_id, Folder.user_id == user.id)
    ).scalar_one_or_none()
    if folder is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Folder not found"
        )
    return folder


def _counts(db: Session, user: User) -> dict[int, int]:
    rows = db.execute(
        select(QR.folder_id, func.count(QR.id))
        .where(QR.created_by == user.id, QR.folder_id.is_not(None))
        .group_by(QR.folder_id)
    ).all()
    return {folder_id: n for folder_id, n in rows}


@router.get("", response_model=list[FolderResponse], summary="Your folders")
def list_folders(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[FolderResponse]:
    counts = _counts(db, user)
    folders = db.execute(
        select(Folder).where(Folder.user_id == user.id).order_by(func.lower(Folder.name))
    ).scalars()
    # By name, not by recency: this list is something people scan for a name
    # they already have in mind, so a stable alphabetical order beats one that
    # reshuffles every time something is filed.
    return [
        FolderResponse(id=f.id, name=f.name, qr_count=counts.get(f.id, 0))
        for f in folders
    ]


@router.post(
    "", response_model=FolderResponse, status_code=201, summary="Create a folder"
)
def create_folder(
    payload: FolderSave,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FolderResponse:
    name = payload.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Folder needs a name"
        )

    folder = Folder(user_id=user.id, name=name)
    db.add(folder)
    try:
        db.commit()
    except IntegrityError:
        # The unique constraint is the check — asking first would still race.
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have a folder called {name}",
        )
    db.refresh(folder)
    return FolderResponse(id=folder.id, name=folder.name, qr_count=0)


@router.patch(
    "/{folder_id}", response_model=FolderResponse, summary="Rename a folder"
)
def rename_folder(
    folder_id: int,
    payload: FolderSave,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> FolderResponse:
    folder = _owned_folder(db, folder_id, user)
    name = payload.name.strip()
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Folder needs a name"
        )

    folder.name = name
    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"You already have a folder called {name}",
        )
    db.refresh(folder)
    return FolderResponse(
        id=folder.id, name=folder.name, qr_count=_counts(db, user).get(folder.id, 0)
    )


@router.delete("/{folder_id}", status_code=204, summary="Delete a folder")
def delete_folder(
    folder_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Delete the folder. The codes inside it are unfiled, never deleted.

    Unfiled explicitly rather than left to the foreign key. ON DELETE SET NULL
    on qrs.folder_id says the same thing and stays as the backstop, but it is
    enforced by the database engine — SQLite does not apply it unless foreign
    keys are switched on — and this is the one guarantee someone pressing
    Delete actually cares about. Stating it in code makes it true everywhere
    and testable on any engine.
    """
    folder = _owned_folder(db, folder_id, user)
    db.query(QR).filter(QR.folder_id == folder.id).update(
        {QR.folder_id: None}, synchronize_session=False
    )
    db.delete(folder)
    db.commit()


@router.put("/assignment", status_code=204, summary="File a code, or unfile it")
def assign(
    payload: FolderAssignment,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    qr = db.execute(
        select(QR).where(QR.id == payload.qr_id, QR.created_by == user.id)
    ).scalar_one_or_none()
    if qr is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="QR not found"
        )

    # None is a real value here: it means take it out of whatever it is in.
    if payload.folder_id is not None:
        _owned_folder(db, payload.folder_id, user)

    qr.folder_id = payload.folder_id
    db.commit()
