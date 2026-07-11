from app.repositories.phone_repository import PhoneRepository
from app.schemas.phone import PhoneCreate, PhoneItemResponse, PhoneUpdate


class PhoneService:
    def __init__(self, repository: PhoneRepository) -> None:
        self.repository = repository

    def create_phone(self, payload: PhoneCreate) -> PhoneItemResponse:
        qr = self.repository.create(payload)
        return PhoneItemResponse.from_qr(qr)

    def get_phone(self, qr_id: int) -> PhoneItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return PhoneItemResponse.from_qr(qr)

    def list_phones(self) -> list[PhoneItemResponse]:
        qrs = self.repository.list_all()
        return [PhoneItemResponse.from_qr(qr) for qr in qrs]

    def update_phone(self, qr_id: int, payload: PhoneUpdate) -> PhoneItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return PhoneItemResponse.from_qr(qr)

    def delete_phone(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
