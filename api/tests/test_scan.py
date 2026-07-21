from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.models.qr import QR
from tests.conftest import seed_website_qr


def test_valid_dynamic_scan_increments_count_and_redirects(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=0, dynamic=True)

    response = scan_client.get("/4uscYp", follow_redirects=False)

    assert response.status_code == 302
    assert response.headers["location"] == "https://google.com"

    qr = db_session.query(QR).filter_by(slug="4uscYp").first()
    assert qr is not None
    assert qr.scans == 1


def test_invalid_slug_returns_404(scan_client: TestClient) -> None:
    response = scan_client.get("/invalidSlug")

    assert response.status_code == 404
    assert response.json() == {"detail": "QR code not found"}


def test_multiple_dynamic_scans_increment_count(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=0, dynamic=True)

    for _ in range(3):
        response = scan_client.get("/4uscYp", follow_redirects=False)
        assert response.status_code == 302

    qr = db_session.query(QR).filter_by(slug="4uscYp").first()
    assert qr is not None
    assert qr.scans == 3


def test_inactive_qr_returns_400_without_redirect(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", status=False, dynamic=True)

    response = scan_client.get("/4uscYp", follow_redirects=False)

    assert response.status_code == 400
    assert response.json() == {"detail": "QR code is inactive"}
    assert "location" not in response.headers


def test_static_qr_redirects_without_incrementing_scans(
    scan_client: TestClient,
    db_session: Session,
) -> None:
    seed_website_qr(db_session, slug="4uscYp", scans=0, dynamic=False)

    response = scan_client.get("/4uscYp", follow_redirects=False)

    assert response.status_code == 302
    assert response.headers["location"] == "https://google.com"

    qr = db_session.query(QR).filter_by(slug="4uscYp").first()
    assert qr is not None
    assert qr.scans == 0
