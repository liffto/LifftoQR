from sqlalchemy.orm import Session

from app.models.qr import QR


class SlugAlreadyExistsError(Exception):
    def __init__(self, slug: str) -> None:
        self.slug = slug
        super().__init__(
            f"Slug '{slug}' is already in use. Please choose a different slug."
        )


def ensure_slug_available(
    db: Session,
    slug: str,
    exclude_qr_id: int | None = None,
) -> None:
    query = db.query(QR.id).filter(QR.slug == slug)
    if exclude_qr_id is not None:
        query = query.filter(QR.id != exclude_qr_id)
    if query.first() is not None:
        raise SlugAlreadyExistsError(slug)
