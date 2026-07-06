from app.repositories.website_repository import WebsiteRepository
from app.schemas.website import WebsiteCreate, WebsiteItemResponse, WebsiteUpdate


class WebsiteService:
    def __init__(self, repository: WebsiteRepository) -> None:
        self.repository = repository

    def create_website(self, payload: WebsiteCreate) -> WebsiteItemResponse:
        qr = self.repository.create(payload)
        return WebsiteItemResponse.from_qr(qr)

    def get_website(self, qr_id: int) -> WebsiteItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return WebsiteItemResponse.from_qr(qr)

    def list_websites(self) -> list[WebsiteItemResponse]:
        qrs = self.repository.list_all()
        return [WebsiteItemResponse.from_qr(qr) for qr in qrs]

    def update_website(
        self, qr_id: int, payload: WebsiteUpdate
    ) -> WebsiteItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return WebsiteItemResponse.from_qr(qr)

    def delete_website(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
