from app.repositories.pdf_repository import PdfRepository
from app.schemas.pdf import PdfCreate, PdfItemResponse, PdfUpdate


class PdfService:
    def __init__(self, repository: PdfRepository) -> None:
        self.repository = repository

    def create_pdf(self, payload: PdfCreate) -> PdfItemResponse:
        qr = self.repository.create(payload)
        return PdfItemResponse.from_qr(qr)

    def get_pdf(self, qr_id: int) -> PdfItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return PdfItemResponse.from_qr(qr)

    def list_pdfs(self) -> list[PdfItemResponse]:
        qrs = self.repository.list_all()
        return [PdfItemResponse.from_qr(qr) for qr in qrs]

    def update_pdf(self, qr_id: int, payload: PdfUpdate) -> PdfItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return PdfItemResponse.from_qr(qr)

    def delete_pdf(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
