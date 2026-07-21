import sys
from collections.abc import Generator
from datetime import date
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

ROOT = Path(__file__).resolve().parents[1]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from app.db.session import get_db
from app.main import app
from app.models import Base, QR, Website

TEST_DATABASE_URL = "sqlite:///:memory:"


@pytest.fixture
def db_session() -> Generator[Session, None, None]:
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(bind=engine)
    session_factory = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = session_factory()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def scan_client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


def seed_website_qr(
    db: Session,
    *,
    slug: str,
    url: str = "https://google.com",
    dynamic: bool = True,
    status: bool = True,
    scans: int = 0,
) -> QR:
    qr = QR(
        type_key="url",
        type="Website URL",
        name="Test QR",
        url=url,
        slug=slug,
        dynamic=dynamic,
        qr_type="Dynamic QR",
        status=status,
        scans=scans,
        edited_on=date.today(),
    )
    db.add(qr)
    db.flush()

    website = Website(qr_id=qr.id, url=url)
    db.add(website)
    db.commit()
    db.refresh(qr)
    return qr
