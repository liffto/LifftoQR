from app.repositories.wifi_repository import WifiRepository
from app.schemas.wifi import WifiCreate, WifiItemResponse, WifiUpdate


class WifiService:
    def __init__(self, repository: WifiRepository) -> None:
        self.repository = repository

    def create_wifi(self, payload: WifiCreate) -> WifiItemResponse:
        qr = self.repository.create(payload)
        return WifiItemResponse.from_qr(qr)

    def get_wifi(self, qr_id: int) -> WifiItemResponse | None:
        qr = self.repository.get_by_qr_id(qr_id)
        if qr is None:
            return None
        return WifiItemResponse.from_qr(qr)

    def list_wifis(self) -> list[WifiItemResponse]:
        qrs = self.repository.list_all()
        return [WifiItemResponse.from_qr(qr) for qr in qrs]

    def update_wifi(self, qr_id: int, payload: WifiUpdate) -> WifiItemResponse | None:
        qr = self.repository.update(qr_id, payload)
        if qr is None:
            return None
        return WifiItemResponse.from_qr(qr)

    def delete_wifi(self, qr_id: int) -> bool:
        return self.repository.delete(qr_id)
