from app.repositories.text_repository import TextRepository
from app.schemas.text import TextCreate, TextItemResponse, TextUpdate


class TextService:
    def __init__(self, repository: TextRepository) -> None:
        self.repository = repository

    def create_text(self, payload: TextCreate) -> TextItemResponse:
        qr = self.repository.create(payload)
        return TextItemResponse.from_qr(qr)

    def get_text(self, qr_id: int) -> TextItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return TextItemResponse.from_qr(qr)

    def list_texts(self) -> list[TextItemResponse]:
        qrs = self.repository.list_all()
        return [TextItemResponse.from_qr(qr) for qr in qrs]

    def update_text(self, qr_id: int, payload: TextUpdate) -> TextItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return TextItemResponse.from_qr(qr)

    def delete_text(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
