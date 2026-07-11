from datetime import date

from sqlalchemy.orm import Session, joinedload

from app.models import LinkTree, LinkTreeLink, QR, Template
from app.repositories.qr_slug import ensure_slug_available
from app.schemas.link_tree import LinkTreeCreate, LinkTreeUpdate

LINKTREE_TYPE_KEY = "linktree"


class LinkTreeRepository:
    def __init__(self, db: Session) -> None:
        self.db = db

    def create(self, payload: LinkTreeCreate) -> QR:
        ensure_slug_available(self.db, payload.slug)

        qr = QR(
            type_key=LINKTREE_TYPE_KEY,
            type="Link Tree",
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

        link_tree = LinkTree(
            title=payload.content.title,
            created_by=payload.created_by,
        )
        link_tree.qr_id = qr.id

        self.db.add(template)
        self.db.add(link_tree)
        self.db.flush()

        for index, link_payload in enumerate(payload.content.links, start=1):
            link = LinkTreeLink(
                link_tree_id=link_tree.id,
                label=link_payload.label,
                url=link_payload.url,
                display_order=link_payload.display_order or index,
                created_by=payload.created_by,
            )
            self.db.add(link)

        self.db.commit()
        return self._get_by_qr_id(qr.id)

    def get_by_qr_id(self, qr_id: int) -> QR | None:
        return self._get_by_qr_id(qr_id)

    def list_all(self) -> list[QR]:
        return (
            self.db.query(QR)
            .options(
                joinedload(QR.link_tree).joinedload(LinkTree.links),
                joinedload(QR.template),
            )
            .filter(QR.type_key == LINKTREE_TYPE_KEY)
            .order_by(QR.id)
            .all()
        )

    def update(self, qr_id: int, payload: LinkTreeUpdate) -> QR | None:
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
            if qr.link_tree is None:
                link_tree = LinkTree(
                    qr_id=qr.id,
                    title=content.title or "",
                    created_by=payload.updated_by,
                )
                self.db.add(link_tree)
                self.db.flush()
            else:
                if content.title is not None:
                    qr.link_tree.title = content.title
                if payload.updated_by is not None:
                    qr.link_tree.updated_by = payload.updated_by
                link_tree = qr.link_tree

            if content.links is not None:
                for existing in list(link_tree.links or []):
                    self.db.delete(existing)
                self.db.flush()
                for index, link_payload in enumerate(content.links, start=1):
                    link = LinkTreeLink(
                        link_tree_id=link_tree.id,
                        label=link_payload.label,
                        url=link_payload.url,
                        display_order=link_payload.display_order or index,
                        created_by=payload.updated_by,
                    )
                    self.db.add(link)

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
                joinedload(QR.link_tree).joinedload(LinkTree.links),
                joinedload(QR.template),
            )
            .filter(QR.id == qr_id, QR.type_key == LINKTREE_TYPE_KEY)
            .first()
        )

