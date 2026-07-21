from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.repositories.qr_repository import QrRepository
from app.services.ws_manager import manager

router = APIRouter(tags=["websocket"])


@router.websocket("/ws/qr/{slug}")
async def qr_scan_websocket(
    websocket: WebSocket,
    slug: str,
    db: Session = Depends(get_db),
) -> None:
    await websocket.accept()

    repository = QrRepository(db)
    qr = repository.get_by_slug(slug)
    if qr is None:
        await websocket.close(code=1008)
        return

    await manager.connect(slug, websocket)
    try:
        await websocket.send_json(
            {
                "event": "scan_count",
                "slug": slug,
                "scan_count": qr.scans,
            }
        )

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(slug, websocket)
