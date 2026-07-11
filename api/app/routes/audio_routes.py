from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.audio_controller import AudioController
from app.dependencies.dependencies import get_audio_controller
from app.schemas.audio import AudioCreate, AudioUpdate


router = APIRouter(
    prefix="/audios",
    tags=["audios"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
async def create_audio(
    payload: AudioCreate,
    request: Request,
    controller: AudioController = Depends(get_audio_controller),
) -> JSONResponse:
    return await controller.create_audio(payload, request.state.user)


@router.get("")
async def list_audios(
    controller: AudioController = Depends(get_audio_controller),
) -> JSONResponse:
    return await controller.list_audios()


@router.get("/{audio_id}")
async def get_audio(
    audio_id: int,
    controller: AudioController = Depends(get_audio_controller),
) -> JSONResponse:
    return await controller.get_audio(audio_id)


@router.put("/{audio_id}")
async def update_audio(
    audio_id: int,
    payload: AudioUpdate,
    request: Request,
    controller: AudioController = Depends(get_audio_controller),
) -> JSONResponse:
    return await controller.update_audio(audio_id, payload, request.state.user)


@router.delete("/{audio_id}")
async def delete_audio(
    audio_id: int,
    controller: AudioController = Depends(get_audio_controller),
) -> JSONResponse:
    return await controller.delete_audio(audio_id)
