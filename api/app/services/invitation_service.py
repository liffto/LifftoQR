from app.repositories.invitation_repository import InvitationRepository
from app.schemas.invitation import InvitationCreate, InvitationItemResponse, InvitationUpdate


class InvitationService:
    def __init__(self, repository: InvitationRepository) -> None:
        self.repository = repository

    def create_invitation(self, payload: InvitationCreate) -> InvitationItemResponse:
        qr = self.repository.create(payload)
        return InvitationItemResponse.from_qr(qr)

    def get_invitation(self, qr_id: int) -> InvitationItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return InvitationItemResponse.from_qr(qr)

    def list_invitations(self) -> list[InvitationItemResponse]:
        qrs = self.repository.list_all()
        return [InvitationItemResponse.from_qr(qr) for qr in qrs]

    def update_invitation(self, qr_id: int, payload: InvitationUpdate) -> InvitationItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return InvitationItemResponse.from_qr(qr)

    def delete_invitation(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
