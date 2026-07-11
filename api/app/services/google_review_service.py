from app.repositories.google_review_repository import GoogleReviewRepository
from app.schemas.google_review import GoogleReviewCreate, GoogleReviewItemResponse, GoogleReviewUpdate


class GoogleReviewService:
    def __init__(self, repository: GoogleReviewRepository) -> None:
        self.repository = repository

    def create_google_review(self, payload: GoogleReviewCreate) -> GoogleReviewItemResponse:
        qr = self.repository.create(payload)
        return GoogleReviewItemResponse.from_qr(qr)

    def get_google_review(self, qr_id: int) -> GoogleReviewItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return GoogleReviewItemResponse.from_qr(qr)

    def list_google_reviews(self) -> list[GoogleReviewItemResponse]:
        qrs = self.repository.list_all()
        return [GoogleReviewItemResponse.from_qr(qr) for qr in qrs]

    def update_google_review(self, qr_id: int, payload: GoogleReviewUpdate) -> GoogleReviewItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return GoogleReviewItemResponse.from_qr(qr)

    def delete_google_review(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
