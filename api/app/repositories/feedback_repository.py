from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models import Feedback, QR, Template
from app.repositories.qr_slug import ensure_slug_available
from app.schemas.feedback import FeedbackCreate, FeedbackUpdate

FEEDBACK_TYPE_KEY = "feedback"


class FeedbackRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: FeedbackCreate) -> QR:
        ensure_slug_available(self.db, payload.slug)

        qr = QR(
            type_key=FEEDBACK_TYPE_KEY,
            type="Feedback",
            name=payload.name,
            url=payload.url or None,
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

        content = Feedback(
            url=payload.content.url,
            prefill_key=payload.content.prefill_key,
            prefill_value=payload.content.prefill_value,
            created_by=payload.created_by,
        )
        content.qr_id = qr.id

        self.db.add(template)
        self.db.add(content)

        self.db.commit()
        return self._get_by_qr_id(qr.id)

    def get_by_qr_id(self, qr_id: int) -> QR | None:
        return self._get_by_qr_id(qr_id)

    def list_all(self) -> list[QR]:
        return (
            self.db.query(QR)
            .options(
                joinedload(QR.feedback),
                joinedload(QR.template),
            )
            .filter(QR.type_key == FEEDBACK_TYPE_KEY)
            .order_by(QR.id)
            .all()
        )

    def update(self, qr_id: int, payload: FeedbackUpdate) -> QR | None:
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

        if payload.content is not None:
            content = payload.content
            if qr.feedback is None:
                row = Feedback(
                    qr_id=qr.id,
                    url=content.url or "",
                    prefill_key=content.prefill_key,
                    prefill_value=content.prefill_value,
                    created_by=payload.updated_by,
                )
                self.db.add(row)
            else:
                if content.url is not None:
                    qr.feedback.url = content.url
                if content.prefill_key is not None:
                    qr.feedback.prefill_key = content.prefill_key
                if content.prefill_value is not None:
                    qr.feedback.prefill_value = content.prefill_value
                if payload.updated_by is not None:
                    qr.feedback.updated_by = payload.updated_by

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
                joinedload(QR.feedback),
                joinedload(QR.template),
            )
            .filter(QR.id == qr_id, QR.type_key == FEEDBACK_TYPE_KEY)
            .first()
        )

