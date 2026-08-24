from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.invitation import InvitationCreate, InvitationUpdate
from app.serializers.response_serializer import success_response
from app.services.invitation_service import InvitationService


class InvitationController:
    def __init__(self, service: InvitationService) -> None:
        self.service = service

    def create_invitation(self, payload: InvitationCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_invitation(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    def get_invitation(self, invitation_id: int) -> JSONResponse:
        item = self.service.get_invitation(invitation_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def list_invitations(self) -> JSONResponse:
        items = self.service.list_invitations()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    def update_invitation(
        self, invitation_id: int, payload: InvitationUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_invitation(invitation_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def delete_invitation(self, invitation_id: int) -> JSONResponse:
        deleted = self.service.delete_invitation(invitation_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Invitation QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Invitation QR deleted successfully"})
        )
