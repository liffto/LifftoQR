from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.pdf import PdfCreate, PdfUpdate
from app.serializers.response_serializer import success_response
from app.services.pdf_service import PdfService


class PdfController:
    def __init__(self, service: PdfService) -> None:
        self.service = service

    async def create_pdf(self, payload: PdfCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_pdf(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    async def get_pdf(self, pdf_id: int) -> JSONResponse:
        item = self.service.get_pdf(pdf_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PDF QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def list_pdfs(self) -> JSONResponse:
        items = self.service.list_pdfs()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    async def update_pdf(
        self, pdf_id: int, payload: PdfUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_pdf(pdf_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PDF QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    async def delete_pdf(self, pdf_id: int) -> JSONResponse:
        deleted = self.service.delete_pdf(pdf_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="PDF QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "PDF QR deleted successfully"})
        )
