from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.serializers.response_serializer import success_response
from app.services.qr_service import QrService


class QrController:
    def __init__(self, service: QrService) -> None:
        self.service = service

    async def list_qrs(self, user: User) -> JSONResponse:
        items = self.service.list_qrs(created_by=user.id)
        return JSONResponse(content=success_response(items))

    async def get_qr(self, qr_id: int, user: User) -> JSONResponse:
        item = self.service.get_qr(qr_id, created_by=user.id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR not found",
            )
        return JSONResponse(content=success_response(item))

    async def delete_qr(self, qr_id: int, user: User) -> JSONResponse:
        deleted = self.service.delete_qr(qr_id, created_by=user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "QR deleted successfully"})
        )
