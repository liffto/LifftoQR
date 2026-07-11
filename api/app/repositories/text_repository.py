from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models.qr import QR
from app.models.template import Template
from app.models.text import Text
from app.repositories.qr_slug import ensure_slug_available
from app.schemas.text import TextCreate, TextUpdate

TEXT_TYPE_KEY = "text"


class TextRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: TextCreate) -> QR:
        ensure_slug_available(self.db, payload.slug)

        qr = QR(
            type_key=TEXT_TYPE_KEY,
            type="Text",
            name=payload.name,
            url=payload.url,
            slug=payload.slug,
            dynamic=payload.dynamic,
            qr_type=payload.qr_type,
            folder=payload.folder,
            status=payload.status,
            scans=payload.scans,
            edited_on=date.today(),
            created_by=payload.created_by,
        )
        self.db.add(qr)
        self.db.flush()

        if qr.id is None:
            raise RuntimeError("Failed to create QR record")

        template = Template(
            created_by=payload.created_by,
            **payload.template.model_dump(),
        )
        template.qr_id = qr.id

        text = Text(
            text=payload.content.text,
            created_by=payload.created_by,
        )
        text.qr_id = qr.id

        self.db.add(template)
        self.db.add(text)
        self.db.commit()
        return self._get_by_qr_id(qr.id)

    def get_by_qr_id(self, qr_id: int) -> QR | None:
        return self._get_by_qr_id(qr_id)

    def list_all(self) -> list[QR]:
        return (
            self.db.query(QR)
            .options(
                joinedload(QR.text),
                joinedload(QR.template),
            )
            .filter(QR.type_key == TEXT_TYPE_KEY)
            .order_by(QR.id)
            .all()
        )

    def update(self, qr_id: int, payload: TextUpdate) -> QR | None:
        qr = self._get_by_qr_id(qr_id)
        if qr is None:
            return None

        if payload.slug is not None:
            ensure_slug_available(self.db, payload.slug, exclude_qr_id=qr_id)

        for field in (
            "name",
            "url",
            "slug",
            "dynamic",
            "qr_type",
            "folder",
            "status",
            "scans",
            "updated_by",
        ):
            value = getattr(payload, field)
            if value is not None:
                setattr(qr, field, value)

        qr.edited_on = date.today()

        if payload.content is not None and payload.content.text is not None:
            if qr.text is None:
                text = Text(
                    qr_id=qr.id,
                    text=payload.content.text,
                    created_by=payload.updated_by,
                )
                self.db.add(text)
            else:
                qr.text.text = payload.content.text
                if payload.updated_by is not None:
                    qr.text.updated_by = payload.updated_by

        if payload.template is not None:
            template_data = payload.template.model_dump()
            if qr.template is None:
                template = Template(
                    qr_id=qr.id,
                    created_by=payload.updated_by,
                    **template_data,
                )
                self.db.add(template)
            else:
                for field, value in template_data.items():
                    setattr(qr.template, field, value)
                if payload.updated_by is not None:
                    qr.template.updated_by = payload.updated_by

        self.db.commit()
        return self._get_by_qr_id(qr_id)

    def delete(self, qr_id: int) -> bool:
        qr = self._get_by_qr_id(qr_id)
        if qr is None:
            return False

        self.db.delete(qr)
        self.db.commit()
        return True

    def _get_by_qr_id(self, qr_id: int) -> QR | None:
        return (
            self.db.query(QR)
            .options(
                joinedload(QR.text),
                joinedload(QR.template),
            )
            .filter(QR.id == qr_id, QR.type_key == TEXT_TYPE_KEY)
            .first()
        )
