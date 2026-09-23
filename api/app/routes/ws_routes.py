from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session
from starlette.concurrency import run_in_threadpool

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

    def lookup_scans() -> int | None:
        """Read the count, then hand the pooled connection straight back.

        get_db closes its session in a finally, which for a socket means when
        the socket ends — and this one parks in receive_text() for as long as
        the dashboard tab is open. Every live socket therefore pinned one
        pooled connection indefinitely, against a pool of ten (pool_size 5 +
        max_overflow 5). A dashboard with a dozen dynamic codes opens a dozen
        sockets, exhausts the pool by itself, and every ordinary request after
        that queues for a connection that is never coming back. That was the
        "everything is slow" symptom.

        Closing here holds a connection for the length of one SELECT instead of
        the length of a browser tab. The dependency's own close still runs at
        the end and is a no-op on an already-closed session — and keeping the
        dependency is what lets the tests inject their own session.
        """
        try:
            qr = QrRepository(db).get_by_slug(slug)
            return qr.scans if qr is not None else None
        finally:
            db.close()

    # Registered before the lookup, not after. The lookup now goes through a
    # threadpool, which yields — and anything between accept() and connect() is
    # a window where the socket is live but would miss a broadcast.
    await manager.connect(slug, websocket)
    try:
        # In a threadpool because the query is blocking SQLAlchemy and this
        # handler is async: FastAPI runs `async def` endpoints on the event
        # loop itself and only offloads plain `def` ones, so calling it
        # directly stalls every other request in the process for the duration.
        scans = await run_in_threadpool(lookup_scans)
        if scans is None:
            await websocket.close(code=1008)
            return

        await websocket.send_json(
            {"event": "scan_count", "slug": slug, "scan_count": scans}
        )

        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        pass
    finally:
        # In a finally, not only on a clean disconnect: a socket dropped any
        # other way would otherwise stay in the manager and be broadcast to
        # forever.
        manager.disconnect(slug, websocket)
