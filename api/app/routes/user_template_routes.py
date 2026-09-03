"""Saved design templates, belonging to a user rather than to a code.

Kept on the direct session pattern the auth routes use rather than the
controller/service/repository stack the QR types use: this is a small
user-scoped list with no per-type behaviour behind it, closer to a preference
than to a QR.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.auth.models import User
from app.db.session import get_db
from app.models.user_template import UserTemplate
from app.schemas.user_template import UserTemplateResponse, UserTemplateSave

router = APIRouter(
    prefix="/templates",
    tags=["templates"],
    dependencies=[Depends(get_current_user)],
)

DESIGN_FIELDS = (
    "logo",
    "logo_size",
    "frame_text",
    "frame",
    "body_pattern",
    "body_gradient",
    "body_color_1",
    "body_color_2",
    "corner_style",
    "corner_gradient",
    "corner_color_1",
    "corner_color_2",
    "background",
)


@router.get("", response_model=list[UserTemplateResponse], summary="Your saved templates")
def list_templates(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[UserTemplate]:
    # Newest first, which is the order the studio's picker has always shown
    # them in — a template just saved is the one most likely to be wanted next.
    return list(
        db.execute(
            select(UserTemplate)
            .where(UserTemplate.user_id == user.id)
            .order_by(UserTemplate.updated_at.desc(), UserTemplate.id.desc())
        ).scalars()
    )


@router.put("", response_model=UserTemplateResponse, summary="Save a template")
def save_template(
    payload: UserTemplateSave,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> UserTemplate:
    """Create a template, or replace the one already using that name.

    An upsert rather than a create, because saving under an existing name has
    always overwritten it in the studio. Doing anything else here would leave
    people with a list of near-identical entries and no way to tell them apart.
    """
    label = payload.label.strip()
    if not label:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Template needs a name"
        )

    existing = db.execute(
        select(UserTemplate).where(
            UserTemplate.user_id == user.id, UserTemplate.label == label
        )
    ).scalar_one_or_none()

    template = existing or UserTemplate(user_id=user.id, label=label)
    for field in DESIGN_FIELDS:
        setattr(template, field, getattr(payload, field))

    if existing is None:
        db.add(template)
    db.commit()
    db.refresh(template)
    return template


@router.delete("/{template_id}", status_code=204, summary="Delete a template")
def delete_template(
    template_id: int,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    template = db.execute(
        select(UserTemplate).where(
            UserTemplate.id == template_id, UserTemplate.user_id == user.id
        )
    ).scalar_one_or_none()
    # Scoped to the caller, so another account's id reads as absent rather than
    # forbidden — there is nothing to be learned from the difference.
    if template is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Template not found"
        )
    db.delete(template)
    db.commit()
