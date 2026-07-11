from app.repositories.link_tree_repository import LinkTreeRepository
from app.schemas.link_tree import LinkTreeCreate, LinkTreeItemResponse, LinkTreeUpdate


class LinkTreeService:
    def __init__(self, repository: LinkTreeRepository) -> None:
        self.repository = repository

    def create_link_tree(self, payload: LinkTreeCreate) -> LinkTreeItemResponse:
        qr = self.repository.create(payload)
        return LinkTreeItemResponse.from_qr(qr)

    def get_link_tree(self, qr_id: int) -> LinkTreeItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return LinkTreeItemResponse.from_qr(qr)

    def list_link_trees(self) -> list[LinkTreeItemResponse]:
        qrs = self.repository.list_all()
        return [LinkTreeItemResponse.from_qr(qr) for qr in qrs]

    def update_link_tree(self, qr_id: int, payload: LinkTreeUpdate) -> LinkTreeItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return LinkTreeItemResponse.from_qr(qr)

    def delete_link_tree(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
