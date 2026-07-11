from app.repositories.app_repository import AppRepository
from app.schemas.app import AppCreate, AppItemResponse, AppUpdate


class AppService:
    def __init__(self, repository: AppRepository) -> None:
        self.repository = repository

    def create_app(self, payload: AppCreate) -> AppItemResponse:
        qr = self.repository.create(payload)
        return AppItemResponse.from_qr(qr)

    def get_app(self, qr_id: int) -> AppItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return AppItemResponse.from_qr(qr)

    def list_apps(self) -> list[AppItemResponse]:
        qrs = self.repository.list_all()
        return [AppItemResponse.from_qr(qr) for qr in qrs]

    def update_app(self, qr_id: int, payload: AppUpdate) -> AppItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return AppItemResponse.from_qr(qr)

    def delete_app(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
