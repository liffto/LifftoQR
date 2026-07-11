from app.repositories.feedback_repository import FeedbackRepository
from app.schemas.feedback import FeedbackCreate, FeedbackItemResponse, FeedbackUpdate


class FeedbackService:
    def __init__(self, repository: FeedbackRepository) -> None:
        self.repository = repository

    def create_feedback(self, payload: FeedbackCreate) -> FeedbackItemResponse:
        qr = self.repository.create(payload)
        return FeedbackItemResponse.from_qr(qr)

    def get_feedback(self, qr_id: int) -> FeedbackItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return FeedbackItemResponse.from_qr(qr)

    def list_feedbacks(self) -> list[FeedbackItemResponse]:
        qrs = self.repository.list_all()
        return [FeedbackItemResponse.from_qr(qr) for qr in qrs]

    def update_feedback(self, qr_id: int, payload: FeedbackUpdate) -> FeedbackItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return FeedbackItemResponse.from_qr(qr)

    def delete_feedback(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
