from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.google_review import GoogleReviewCreate, GoogleReviewUpdate
from app.serializers.response_serializer import success_response
from app.services.google_review_service import GoogleReviewService


class GoogleReviewController:
    def __init__(self, service: GoogleReviewService) -> None:
        self.service = service

    def create_google_review(self, payload: GoogleReviewCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_google_review(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    def get_google_review(self, google_review_id: int) -> JSONResponse:
        item = self.service.get_google_review(google_review_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Google Review QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def list_google_reviews(self) -> JSONResponse:
        items = self.service.list_google_reviews()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    def update_google_review(
        self, google_review_id: int, payload: GoogleReviewUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_google_review(google_review_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Google Review QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def delete_google_review(self, google_review_id: int) -> JSONResponse:
        deleted = self.service.delete_google_review(google_review_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Google Review QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Google Review QR deleted successfully"})
        )
