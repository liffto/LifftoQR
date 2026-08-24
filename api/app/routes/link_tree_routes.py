from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.link_tree_controller import LinkTreeController
from app.dependencies.dependencies import get_link_tree_controller
from app.schemas.link_tree import LinkTreeCreate, LinkTreeUpdate


router = APIRouter(
    prefix="/link-trees",
    tags=["link-trees"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_link_tree(
    payload: LinkTreeCreate,
    request: Request,
    controller: LinkTreeController = Depends(get_link_tree_controller),
) -> JSONResponse:
    return controller.create_link_tree(payload, request.state.user)


@router.get("")
def list_link_trees(
    controller: LinkTreeController = Depends(get_link_tree_controller),
) -> JSONResponse:
    return controller.list_link_trees()


@router.get("/{link_tree_id}")
def get_link_tree(
    link_tree_id: int,
    controller: LinkTreeController = Depends(get_link_tree_controller),
) -> JSONResponse:
    return controller.get_link_tree(link_tree_id)


@router.put("/{link_tree_id}")
def update_link_tree(
    link_tree_id: int,
    payload: LinkTreeUpdate,
    request: Request,
    controller: LinkTreeController = Depends(get_link_tree_controller),
) -> JSONResponse:
    return controller.update_link_tree(link_tree_id, payload, request.state.user)


@router.delete("/{link_tree_id}")
def delete_link_tree(
    link_tree_id: int,
    controller: LinkTreeController = Depends(get_link_tree_controller),
) -> JSONResponse:
    return controller.delete_link_tree(link_tree_id)
