from datetime import timedelta

from app.auth import service as auth_service


def test_verify_google_id_token_uses_expected_claims(monkeypatch) -> None:
    class FakeSigningKey:
        key = "test-key"

    class FakeJWKClient:
        def __init__(self, *_args, **_kwargs) -> None:
            pass

        def get_signing_key_from_jwt(self, _token: str) -> FakeSigningKey:
            return FakeSigningKey()

    def fake_decode(token, key, algorithms, audience, issuer, leeway, options):
        assert token == "dummy-token"
        assert key == "test-key"
        assert algorithms == ["RS256"]
        assert audience == "google-client-id"
        assert issuer == ["accounts.google.com", "https://accounts.google.com"]
        assert options["verify_exp"] is True
        # Clock-skew tolerance: without it a server clock a few seconds fast
        # rejects otherwise-valid Google tokens as not-yet-issued/expired.
        assert leeway == timedelta(seconds=30)
        return {"sub": "google-user-1", "email": "user@example.com", "email_verified": True}

    monkeypatch.setattr(auth_service, "PyJWKClient", FakeJWKClient)
    monkeypatch.setattr(auth_service.jwt, "decode", fake_decode)
    monkeypatch.setattr(auth_service.settings, "google_client_id", "google-client-id")

    payload = auth_service.verify_google_id_token("dummy-token")

    assert payload["sub"] == "google-user-1"
    assert payload["email"] == "user@example.com"
    assert payload["email_verified"] is True
