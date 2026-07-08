from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.email import EmailCreate, EmailUpdate
from app.serializers.response_serializer import success_response
from app.services.email_service import EmailService


class EmailController:
    def __init__(self, service: EmailService) -> None:
        self.service = service

    async def create_email(self, payload: EmailCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        email = self.service.create_email(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(email.model_dump(mode="json", by_alias=True)),
        )

    async def get_email(self, email_id: int) -> JSONResponse:
        email = self.service.get_email(email_id)
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email QR not found",
            )
        return JSONResponse(content=success_response(email.model_dump(mode="json", by_alias=True)))

    async def list_emails(self) -> JSONResponse:
        emails = self.service.list_emails()
        return JSONResponse(
            content=success_response(
                [email.model_dump(mode="json", by_alias=True) for email in emails]
            )
        )

    async def update_email(
        self, email_id: int, payload: EmailUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        email = self.service.update_email(email_id, payload)
        if email is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email QR not found",
            )
        return JSONResponse(content=success_response(email.model_dump(mode="json", by_alias=True)))

    async def delete_email(self, email_id: int) -> JSONResponse:
        deleted = self.service.delete_email(email_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Email QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Email QR deleted successfully"})
        )
