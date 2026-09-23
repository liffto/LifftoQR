"""Folders — the groups a person files their codes into.

The behaviours pinned here are the ones that make a folder a folder rather than
a label on a code: it can exist while empty, it is scoped to its owner, its name
is unique within an account, and deleting it unfiles its codes instead of
deleting them. That last one is the whole reason the foreign key is SET NULL,
and it is the thing someone pressing Delete is afraid of.
"""

from collections.abc import Generator

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.auth.dependencies import get_current_user
from app.db.session import get_db
from app.main import app
from app.models import QR
from app.models.folder import Folder


class _User:
    """Stands in for the authenticated user — the routes only read `.id`."""

    def __init__(self, uid: int) -> None:
        self.id = uid


ME = 1
SOMEONE_ELSE = 2


@pytest.fixture
def client(db_session: Session) -> Generator[TestClient, None, None]:
    def override_get_db() -> Generator[Session, None, None]:
        yield db_session

    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_current_user] = lambda: _User(ME)
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def _make_qr(db: Session, *, slug: str, created_by: int = ME) -> QR:
    qr = QR(
        type_key="url",
        type="Website",
        name=f"code {slug}",
        url="https://example.com",
        slug=slug,
        dynamic=True,
        qr_type="Dynamic QR",
        status=True,
        scans=0,
        created_by=created_by,
    )
    db.add(qr)
    db.commit()
    db.refresh(qr)
    return qr


def _create(client: TestClient, name: str):
    return client.post("/api/v1/folders", json={"name": name})


# ── existing on its own ───────────────────────────────────────────────────


def test_a_folder_can_exist_while_empty(client):
    """The reason folders are rows and not a string on a code."""
    created = _create(client, "Marketing")
    assert created.status_code == 201
    assert created.json()["qrCount"] == 0

    listed = client.get("/api/v1/folders").json()
    assert [f["name"] for f in listed] == ["Marketing"]


def test_a_blank_name_is_refused(client):
    assert _create(client, "   ").status_code == 400


def test_the_name_is_trimmed(client):
    assert _create(client, "  Spring  ").json()["name"] == "Spring"


def test_two_folders_cannot_share_a_name(client):
    _create(client, "Marketing")
    clash = _create(client, "Marketing")
    assert clash.status_code == 409
    assert "Marketing" in clash.json()["detail"]


def test_folders_are_listed_alphabetically(client, db_session):
    for name in ("zebra", "Apple", "mango"):
        _create(client, name)
    names = [f["name"] for f in client.get("/api/v1/folders").json()]
    # Case-insensitive, or "Apple" would sort after "mango".
    assert names == ["Apple", "mango", "zebra"]


# ── filing codes ──────────────────────────────────────────────────────────


def test_filing_a_code_shows_up_in_the_count(client, db_session):
    folder_id = _create(client, "Marketing").json()["id"]
    qr = _make_qr(db_session, slug="aaa")

    moved = client.put(
        "/api/v1/folders/assignment", json={"qrId": qr.id, "folderId": folder_id}
    )
    assert moved.status_code == 204
    assert client.get("/api/v1/folders").json()[0]["qrCount"] == 1


def test_a_code_can_be_taken_out_of_every_folder(client, db_session):
    folder_id = _create(client, "Marketing").json()["id"]
    qr = _make_qr(db_session, slug="bbb")
    client.put(
        "/api/v1/folders/assignment", json={"qrId": qr.id, "folderId": folder_id}
    )

    # null is a real instruction here, not a missing field.
    out = client.put(
        "/api/v1/folders/assignment", json={"qrId": qr.id, "folderId": None}
    )
    assert out.status_code == 204
    assert client.get("/api/v1/folders").json()[0]["qrCount"] == 0


def test_filing_someone_elses_code_is_refused(client, db_session):
    folder_id = _create(client, "Marketing").json()["id"]
    theirs = _make_qr(db_session, slug="ccc", created_by=SOMEONE_ELSE)

    refused = client.put(
        "/api/v1/folders/assignment", json={"qrId": theirs.id, "folderId": folder_id}
    )
    assert refused.status_code == 404


def test_filing_into_someone_elses_folder_is_refused(client, db_session):
    theirs = Folder(user_id=SOMEONE_ELSE, name="Theirs")
    db_session.add(theirs)
    db_session.commit()
    db_session.refresh(theirs)
    mine = _make_qr(db_session, slug="ddd")

    refused = client.put(
        "/api/v1/folders/assignment", json={"qrId": mine.id, "folderId": theirs.id}
    )
    assert refused.status_code == 404


# ── renaming ──────────────────────────────────────────────────────────────


def test_renaming_changes_it_everywhere_at_once(client, db_session):
    folder_id = _create(client, "Markting").json()["id"]
    qr = _make_qr(db_session, slug="eee")
    client.put(
        "/api/v1/folders/assignment", json={"qrId": qr.id, "folderId": folder_id}
    )

    renamed = client.patch(f"/api/v1/folders/{folder_id}", json={"name": "Marketing"})
    assert renamed.status_code == 200
    # The code did not have to be touched — that is the point of a row.
    assert renamed.json() == {"id": folder_id, "name": "Marketing", "qrCount": 1}


def test_renaming_onto_an_existing_name_is_refused(client):
    _create(client, "Marketing")
    other = _create(client, "Sales").json()["id"]
    assert client.patch(f"/api/v1/folders/{other}", json={"name": "Marketing"}).status_code == 409


# ── deleting: the one people are afraid of ────────────────────────────────


def test_deleting_a_folder_unfiles_its_codes_and_deletes_none_of_them(
    client, db_session
):
    folder_id = _create(client, "Marketing").json()["id"]
    kept = [_make_qr(db_session, slug=f"keep{i}") for i in range(3)]
    for qr in kept:
        client.put(
            "/api/v1/folders/assignment", json={"qrId": qr.id, "folderId": folder_id}
        )

    assert client.delete(f"/api/v1/folders/{folder_id}").status_code == 204

    db_session.expire_all()
    survivors = db_session.query(QR).filter(QR.id.in_([q.id for q in kept])).all()
    assert len(survivors) == 3, "deleting a folder must never delete the codes in it"
    assert all(q.folder_id is None for q in survivors), "they should be unfiled"
    assert client.get("/api/v1/folders").json() == []


# ── ownership ─────────────────────────────────────────────────────────────


def test_only_your_own_folders_are_listed(client, db_session):
    db_session.add(Folder(user_id=SOMEONE_ELSE, name="Theirs"))
    db_session.commit()
    _create(client, "Mine")

    assert [f["name"] for f in client.get("/api/v1/folders").json()] == ["Mine"]


@pytest.mark.parametrize(
    "call",
    [
        lambda c, fid: c.patch(f"/api/v1/folders/{fid}", json={"name": "x"}),
        lambda c, fid: c.delete(f"/api/v1/folders/{fid}"),
    ],
)
def test_someone_elses_folder_reads_as_absent_not_forbidden(client, db_session, call):
    theirs = Folder(user_id=SOMEONE_ELSE, name="Theirs")
    db_session.add(theirs)
    db_session.commit()
    db_session.refresh(theirs)
    # 404 rather than 403: there is nothing to learn from the difference.
    assert call(client, theirs.id).status_code == 404
