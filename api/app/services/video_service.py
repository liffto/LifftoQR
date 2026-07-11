from app.repositories.video_repository import VideoRepository
from app.schemas.video import VideoCreate, VideoItemResponse, VideoUpdate


class VideoService:
    def __init__(self, repository: VideoRepository) -> None:
        self.repository = repository

    def create_video(self, payload: VideoCreate) -> VideoItemResponse:
        qr = self.repository.create(payload)
        return VideoItemResponse.from_qr(qr)

    def get_video(self, qr_id: int) -> VideoItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return VideoItemResponse.from_qr(qr)

    def list_videos(self) -> list[VideoItemResponse]:
        qrs = self.repository.list_all()
        return [VideoItemResponse.from_qr(qr) for qr in qrs]

    def update_video(self, qr_id: int, payload: VideoUpdate) -> VideoItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return VideoItemResponse.from_qr(qr)

    def delete_video(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
