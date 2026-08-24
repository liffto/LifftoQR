from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.app import AppCreate, AppUpdate
from app.serializers.response_serializer import success_response
from app.services.app_service import AppService


class AppController:
    def __init__(self, service: AppService) -> None:
        self.service = service

    def create_app(self, payload: AppCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_app(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    def get_app(self, app_id: int) -> JSONResponse:
        item = self.service.get_app(app_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def list_apps(self) -> JSONResponse:
        items = self.service.list_apps()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    def update_app(
        self, app_id: int, payload: AppUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_app(app_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def delete_app(self, app_id: int) -> JSONResponse:
        deleted = self.service.delete_app(app_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="App QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "App QR deleted successfully"})
        )
