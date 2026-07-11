from app.repositories.social_media_repository import SocialMediaRepository
from app.schemas.social_media import SocialMediaCreate, SocialMediaItemResponse, SocialMediaUpdate


class SocialMediaService:
    def __init__(self, repository: SocialMediaRepository) -> None:
        self.repository = repository

    def create_social_media(self, payload: SocialMediaCreate) -> SocialMediaItemResponse:
        qr = self.repository.create(payload)
        return SocialMediaItemResponse.from_qr(qr)

    def get_social_media(self, qr_id: int) -> SocialMediaItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return SocialMediaItemResponse.from_qr(qr)

    def list_social_media(self) -> list[SocialMediaItemResponse]:
        qrs = self.repository.list_all()
        return [SocialMediaItemResponse.from_qr(qr) for qr in qrs]

    def update_social_media(self, qr_id: int, payload: SocialMediaUpdate) -> SocialMediaItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return SocialMediaItemResponse.from_qr(qr)

    def delete_social_media(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
