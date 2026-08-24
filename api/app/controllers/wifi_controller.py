from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.wifi import WifiCreate, WifiUpdate
from app.serializers.response_serializer import success_response
from app.services.wifi_service import WifiService


class WifiController:
    def __init__(self, service: WifiService) -> None:
        self.service = service

    def create_wifi(self, payload: WifiCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        wifi = self.service.create_wifi(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(wifi.model_dump(mode="json", by_alias=True)),
        )

    def get_wifi(self, wifi_id: int) -> JSONResponse:
        wifi = self.service.get_wifi(wifi_id)
        if wifi is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wi-Fi QR not found",
            )
        return JSONResponse(content=success_response(wifi.model_dump(mode="json", by_alias=True)))

    def list_wifis(self) -> JSONResponse:
        wifis = self.service.list_wifis()
        return JSONResponse(
            content=success_response(
                [wifi.model_dump(mode="json", by_alias=True) for wifi in wifis]
            )
        )

    def update_wifi(
        self, wifi_id: int, payload: WifiUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        wifi = self.service.update_wifi(wifi_id, payload)
        if wifi is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wi-Fi QR not found",
            )
        return JSONResponse(content=success_response(wifi.model_dump(mode="json", by_alias=True)))

    def delete_wifi(self, wifi_id: int) -> JSONResponse:
        deleted = self.service.delete_wifi(wifi_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Wi-Fi QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Wi-Fi QR deleted successfully"})
        )
