from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.invitation_controller import InvitationController
from app.dependencies.dependencies import get_invitation_controller
from app.schemas.invitation import InvitationCreate, InvitationUpdate


router = APIRouter(
    prefix="/invitations",
    tags=["invitations"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_invitation(
    payload: InvitationCreate,
    request: Request,
    controller: InvitationController = Depends(get_invitation_controller),
) -> JSONResponse:
    return await controller.create_invitation(payload, request.state.user)


@router.get("")
async def list_invitations(
    controller: InvitationController = Depends(get_invitation_controller),
) -> JSONResponse:
    return await controller.list_invitations()


@router.get("/{invitation_id}")
async def get_invitation(
    invitation_id: int,
    controller: InvitationController = Depends(get_invitation_controller),
) -> JSONResponse:
    return await controller.get_invitation(invitation_id)


@router.put("/{invitation_id}")
async def update_invitation(
    invitation_id: int,
    payload: InvitationUpdate,
    request: Request,
    controller: InvitationController = Depends(get_invitation_controller),
) -> JSONResponse:
    return await controller.update_invitation(invitation_id, payload, request.state.user)


@router.delete("/{invitation_id}")
async def delete_invitation(
    invitation_id: int,
    controller: InvitationController = Depends(get_invitation_controller),
) -> JSONResponse:
    return await controller.delete_invitation(invitation_id)
