from app.repositories.whatsapp_repository import WhatsappRepository
from app.schemas.whatsapp import WhatsappCreate, WhatsappItemResponse, WhatsappUpdate


class WhatsappService:
    def __init__(self, repository: WhatsappRepository) -> None:
        self.repository = repository

    def create_whatsapp(self, payload: WhatsappCreate) -> WhatsappItemResponse:
        qr = self.repository.create(payload)
        return WhatsappItemResponse.from_qr(qr)

    def get_whatsapp(self, qr_id: int) -> WhatsappItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return WhatsappItemResponse.from_qr(qr)

    def list_whatsapp(self) -> list[WhatsappItemResponse]:
        qrs = self.repository.list_all()
        return [WhatsappItemResponse.from_qr(qr) for qr in qrs]

    def update_whatsapp(
        self, qr_id: int, payload: WhatsappUpdate
    ) -> WhatsappItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return WhatsappItemResponse.from_qr(qr)

    def delete_whatsapp(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
