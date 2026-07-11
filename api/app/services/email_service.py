from app.repositories.email_repository import EmailRepository
from app.schemas.email import EmailCreate, EmailItemResponse, EmailUpdate


class EmailService:
    def __init__(self, repository: EmailRepository) -> None:
        self.repository = repository

    def create_email(self, payload: EmailCreate) -> EmailItemResponse:
        qr = self.repository.create(payload)
        return EmailItemResponse.from_qr(qr)

    def get_email(self, qr_id: int) -> EmailItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return EmailItemResponse.from_qr(qr)

    def list_emails(self) -> list[EmailItemResponse]:
        qrs = self.repository.list_all()
        return [EmailItemResponse.from_qr(qr) for qr in qrs]

    def update_email(self, qr_id: int, payload: EmailUpdate) -> EmailItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return EmailItemResponse.from_qr(qr)

    def delete_email(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
