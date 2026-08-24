from fastapi import HTTPException, status
from fastapi.responses import JSONResponse

from app.auth.models import User
from app.schemas.link_tree import LinkTreeCreate, LinkTreeUpdate
from app.serializers.response_serializer import success_response
from app.services.link_tree_service import LinkTreeService


class LinkTreeController:
    def __init__(self, service: LinkTreeService) -> None:
        self.service = service

    def create_link_tree(self, payload: LinkTreeCreate, user: User) -> JSONResponse:
        payload = payload.model_copy(update={"created_by": user.id})
        item = self.service.create_link_tree(payload)
        return JSONResponse(
            status_code=status.HTTP_201_CREATED,
            content=success_response(item.model_dump(mode="json", by_alias=True)),
        )

    def get_link_tree(self, link_tree_id: int) -> JSONResponse:
        item = self.service.get_link_tree(link_tree_id)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Link Tree QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def list_link_trees(self) -> JSONResponse:
        items = self.service.list_link_trees()
        return JSONResponse(
            content=success_response(
                [item.model_dump(mode="json", by_alias=True) for item in items]
            )
        )

    def update_link_tree(
        self, link_tree_id: int, payload: LinkTreeUpdate, user: User
    ) -> JSONResponse:
        payload = payload.model_copy(update={"updated_by": user.id})
        item = self.service.update_link_tree(link_tree_id, payload)
        if item is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Link Tree QR not found",
            )
        return JSONResponse(content=success_response(item.model_dump(mode="json", by_alias=True)))

    def delete_link_tree(self, link_tree_id: int) -> JSONResponse:
        deleted = self.service.delete_link_tree(link_tree_id)
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Link Tree QR not found",
            )
        return JSONResponse(
            content=success_response({"message": "Link Tree QR deleted successfully"})
        )
