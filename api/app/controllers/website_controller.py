from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.website import WebsiteCreate, WebsiteUpdate
from app.serializers.response_serializer import success_response
from app.services.website_service import WebsiteService


class WebsiteController:
    def __init__(self, service: WebsiteService) -> None:
        self.service = service

    def create_website(self, payload: WebsiteCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        website = self.service.create_website(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(website.model_dump(mode="json", by_alias=True)),
        )

    def get_website(self, website_id: int) -> JSONResponse:
        website = self.service.get_website(website_id)
        if website is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Website not found",
            )
        return JSONResponse(content=success_response(website.model_dump(mode="json", by_alias=True)))

    def list_websites(self) -> JSONResponse:
        websites = self.service.list_websites()
        return JSONResponse(
            content=success_response(
                [website.model_dump(mode="json", by_alias=True) for website in websites]
            )
        )

    def update_website(
        self, website_id: int, payload: WebsiteUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        website = self.service.update_website(website_id, payload)
        if website is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Website not found",
            )
        return JSONResponse(content=success_response(website.model_dump(mode="json", by_alias=True)))

    def delete_website(self, website_id: int) -> JSONResponse:
        deleted = self.service.delete_website(website_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Website not found",
            )
        return JSONResponse(
            content=success_response({"message": "Website deleted successfully"})
        )
