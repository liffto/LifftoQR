from fastapi.testclient import TestClient

from app.core.security import hash_password, verify_password
from app.main import app


client = TestClient(app)


def test_health_check() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_create_user() -> None:
    response = client.post(
        "/users",
        json={"name": "Ada Lovelace", "email": "ada@example.com"},
    )

    assert response.status_code == 201
    assert response.json()["data"]["email"] == "ada@example.com"


def test_hash_password_supports_long_passwords() -> None:
    password = "karthik@123456" * 6
    hashed = hash_password(password)

    assert hashed
    assert verify_password(password, hashed) is True
