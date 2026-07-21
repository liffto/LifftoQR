from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.qr import QR
from app.services.ws_manager import manager
from tests.conftest import seed_website_qr


def test_websocket_connect_sends_current_scan_count(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=10, dynamic=True)

    with scan_client.websocket_connect("/ws/qr/4uscYp") as websocket:
        data = websocket.receive_json()

    assert data == {
        "event": "scan_count",
        "slug": "4uscYp",
        "scan_count": 10,
    }


def test_valid_scan_broadcasts_updated_count(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=10, dynamic=True)

    with scan_client.websocket_connect("/ws/qr/4uscYp") as websocket:
        assert websocket.receive_json()["scan_count"] == 10

        response = scan_client.get("/4uscYp", follow_redirects=False)
        assert response.status_code == 302
        assert response.headers["location"] == "https://google.com"

        update = websocket.receive_json()
        assert update == {
            "event": "scan_count_updated",
            "slug": "4uscYp",
            "scan_count": 11,
        }

    qr = db_session.query(QR).filter_by(slug="4uscYp").first()
    assert qr is not None
    assert qr.scans == 11


def test_invalid_slug_websocket_closes_with_policy_violation(
    scan_client: TestClient,
) -> None:
    with scan_client.websocket_connect("/ws/qr/invalidSlug") as websocket:
        message = websocket.receive()
        assert message["type"] == "websocket.close"
        assert message.get("code") == 1008


def test_inactive_qr_does_not_broadcast_or_increment(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=5, status=False, dynamic=True)

    with scan_client.websocket_connect("/ws/qr/4uscYp") as websocket:
        assert websocket.receive_json()["scan_count"] == 5

        response = scan_client.get("/4uscYp", follow_redirects=False)
        assert response.status_code == 400

    qr = db_session.query(QR).filter_by(slug="4uscYp").first()
    assert qr is not None
    assert qr.scans == 5


def test_multiple_scans_broadcast_correct_counts(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=0, dynamic=True)

    with scan_client.websocket_connect("/ws/qr/4uscYp") as websocket:
        assert websocket.receive_json()["scan_count"] == 0

        for expected in (1, 2, 3):
            response = scan_client.get("/4uscYp", follow_redirects=False)
            assert response.status_code == 302
            update = websocket.receive_json()
            assert update == {
                "event": "scan_count_updated",
                "slug": "4uscYp",
                "scan_count": expected,
            }

    qr = db_session.query(QR).filter_by(slug="4uscYp").first()
    assert qr is not None
    assert qr.scans == 3


def test_static_qr_does_not_broadcast_scan_update(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=0, dynamic=False)

    with scan_client.websocket_connect("/ws/qr/4uscYp") as websocket:
        assert websocket.receive_json()["scan_count"] == 0

        response = scan_client.get("/4uscYp", follow_redirects=False)
        assert response.status_code == 302

    qr = db_session.query(QR).filter_by(slug="4uscYp").first()
    assert qr is not None
    assert qr.scans == 0


def test_websocket_disconnect_removes_client_from_manager(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=0, dynamic=True)
    manager.active_connections.clear()

    with scan_client.websocket_connect("/ws/qr/4uscYp") as websocket:
        assert manager.connection_count("4uscYp") == 1
        websocket.receive_json()

    assert manager.connection_count("4uscYp") == 0
