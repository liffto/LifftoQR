from app.repositories.sms_repository import SmsRepository
from app.schemas.sms import SmsCreate, SmsItemResponse, SmsUpdate


class SmsService:
    def __init__(self, repository: SmsRepository) -> None:
        self.repository = repository

    def create_sms(self, payload: SmsCreate) -> SmsItemResponse:
        qr = self.repository.create(payload)
        return SmsItemResponse.from_qr(qr)

    def get_sms(self, qr_id: int) -> SmsItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return SmsItemResponse.from_qr(qr)

    def list_sms(self) -> list[SmsItemResponse]:
        qrs = self.repository.list_all()
        return [SmsItemResponse.from_qr(qr) for qr in qrs]

    def update_sms(self, qr_id: int, payload: SmsUpdate) -> SmsItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return SmsItemResponse.from_qr(qr)

    def delete_sms(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
