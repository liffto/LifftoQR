from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models import QR, Sms, Template
from app.repositories.qr_slug import ensure_slug_available
from app.schemas.sms import SmsCreate, SmsUpdate

SMS_TYPE_KEY = "sms"


class SmsRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: SmsCreate) -> QR:
        ensure_slug_available(self.db, payload.slug)

        qr = QR(
            type_key=SMS_TYPE_KEY,
            type="SMS",
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

        sms = Sms(
            number=payload.content.number,
            message=payload.content.message,
            created_by=payload.created_by,
        )
        sms.qr_id = qr.id

        self.db.add(template)
        self.db.add(sms)
        self.db.commit()
        return self._get_by_qr_id(qr.id)

    def get_by_qr_id(self, qr_id: int) -> QR | None:
        return self._get_by_qr_id(qr_id)

    def list_all(self) -> list[QR]:
        return (
            self.db.query(QR)
            .options(
                joinedload(QR.sms),
                joinedload(QR.template),
            )
            .filter(QR.type_key == SMS_TYPE_KEY)
            .order_by(QR.id)
            .all()
        )

    def update(self, qr_id: int, payload: SmsUpdate) -> QR | None:
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
            if qr.sms is None:
                sms = Sms(
                    qr_id=qr.id,
                    number=content.number or "",
                    message=content.message,
                    created_by=payload.updated_by,
                )
                self.db.add(sms)
            else:
                if content.number is not None:
                    qr.sms.number = content.number
                if content.message is not None:
                    qr.sms.message = content.message
                if payload.updated_by is not None:
                    qr.sms.updated_by = payload.updated_by

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
                joinedload(QR.sms),
                joinedload(QR.template),
            )
            .filter(QR.id == qr_id, QR.type_key == SMS_TYPE_KEY)
            .first()
        )
