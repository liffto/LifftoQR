from app.repositories.audio_repository import AudioRepository
from app.schemas.audio import AudioCreate, AudioItemResponse, AudioUpdate


class AudioService:
    def __init__(self, repository: AudioRepository) -> None:
        self.repository = repository

    def create_audio(self, payload: AudioCreate) -> AudioItemResponse:
        qr = self.repository.create(payload)
        return AudioItemResponse.from_qr(qr)

    def get_audio(self, qr_id: int) -> AudioItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return AudioItemResponse.from_qr(qr)

    def list_audios(self) -> list[AudioItemResponse]:
        qrs = self.repository.list_all()
        return [AudioItemResponse.from_qr(qr) for qr in qrs]

    def update_audio(self, qr_id: int, payload: AudioUpdate) -> AudioItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return AudioItemResponse.from_qr(qr)

    def delete_audio(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
