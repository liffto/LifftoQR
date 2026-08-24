from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse

from app.auth.dependencies import get_current_user
from app.controllers.pdf_controller import PdfController
from app.dependencies.dependencies import get_pdf_controller
from app.schemas.pdf import PdfCreate, PdfUpdate


router = APIRouter(
    prefix="/pdfs",
    tags=["pdfs"],
    dependencies=[Depends(get_current_user)],
)


@router.post("", status_code=201)
def create_pdf(
    payload: PdfCreate,
    request: Request,
    controller: PdfController = Depends(get_pdf_controller),
) -> JSONResponse:
    return controller.create_pdf(payload, request.state.user)


@router.get("")
def list_pdfs(
    controller: PdfController = Depends(get_pdf_controller),
) -> JSONResponse:
    return controller.list_pdfs()


@router.get("/{pdf_id}")
def get_pdf(
    pdf_id: int,
    controller: PdfController = Depends(get_pdf_controller),
) -> JSONResponse:
    return controller.get_pdf(pdf_id)


@router.put("/{pdf_id}")
def update_pdf(
    pdf_id: int,
    payload: PdfUpdate,
    request: Request,
    controller: PdfController = Depends(get_pdf_controller),
) -> JSONResponse:
    return controller.update_pdf(pdf_id, payload, request.state.user)


@router.delete("/{pdf_id}")
def delete_pdf(
    pdf_id: int,
    controller: PdfController = Depends(get_pdf_controller),
) -> JSONResponse:
    return controller.delete_pdf(pdf_id)
