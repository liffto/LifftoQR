from app.repositories.vcard_repository import VcardRepository
from app.schemas.vcard import VcardCreate, VcardItemResponse, VcardUpdate


class VcardService:
    def __init__(self, repository: VcardRepository) -> None:
        self.repository = repository

    def create_vcard(self, payload: VcardCreate) -> VcardItemResponse:
        qr = self.repository.create(payload)
        return VcardItemResponse.from_qr(qr)

    def get_vcard(self, qr_id: int) -> VcardItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return VcardItemResponse.from_qr(qr)

    def list_vcards(self) -> list[VcardItemResponse]:
        qrs = self.repository.list_all()
        return [VcardItemResponse.from_qr(qr) for qr in qrs]

    def update_vcard(self, qr_id: int, payload: VcardUpdate) -> VcardItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return VcardItemResponse.from_qr(qr)

    def delete_vcard(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
