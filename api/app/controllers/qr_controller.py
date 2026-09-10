from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.serializers.response_serializer import success_response
from app.services.qr_service import QrService


class QrController:
    def __init__(self, service: QrService) -> None:
        self.service = service

    def list_qrs(self, user: User) -> JSONResponse:
        items = self.service.list_qrs(created_by=user.id)
        return JSONResponse(content=success_response(items))

    def scan_tracking(self, user: User) -> JSONResponse:
        """When unique-scan tracking began, for the dashboard's label.

        Scans were a single counter until scan_events landed, so a unique
        figure cannot speak for anything before the first recorded scan. The
        dashboard says so rather than showing a small number beside a large
        total and letting it look like a bug.
        """
        started = self.service.scan_tracking_started_at()
        return JSONResponse(
            content=success_response(
                {"since": started.isoformat() if started else None}
            )
        )

    def scan_series(self, qr_id: int, days: int, user: User) -> JSONResponse:
        """Daily scan/unique counts for one of the user's codes, for the graph
        in the QR details modal."""
        series = self.service.scan_series(qr_id, created_by=user.id, days=days)
        if series is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR not found",
            )
        return JSONResponse(content=success_response(series))

    def get_qr(self, qr_id: int, user: User) -> JSONResponse:
        item = self.service.get_qr(qr_id, created_by=user.id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR not found",
            )
        return JSONResponse(content=success_response(item))

    def delete_qr(self, qr_id: int, user: User) -> JSONResponse:
        deleted = self.service.delete_qr(qr_id, created_by=user.id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "QR deleted successfully"})
        )
