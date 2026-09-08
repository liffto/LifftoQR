"""The startup guard against a weak JWT secret in production.

A placeholder secret is a full authentication bypass — anyone who knows it can
forge a token for any user — so production must refuse to boot on one. These
pin the boundary: strict in production, out of the way everywhere else.
"""

import pytest

from app.config.settings import settings
import app.core.secret_check as sc


@pytest.fixture(autouse=True)
def restore_settings():
    env, key = settings.environment, settings.jwt_secret_key
    yield
    settings.environment, settings.jwt_secret_key = env, key


def _run(environment, secret):
    # The guard reads settings live, so mutating them is enough — no reload,
    # which would swap the exception class out from under pytest.raises.
    settings.environment = environment
    settings.jwt_secret_key = secret
    sc.verify_jwt_secret_is_strong()


STRONG = "UKDrQQMG_WYkGP4YwEbAXhBQ5UmhtXhG9qvU46QOR9ClUFU10uaKHsuTpESyZNHz"


def test_production_refuses_the_placeholder_that_shipped():
    with pytest.raises(sc.WeakJWTSecretError):
        _run("production", "super-secure-secret-key")


def test_production_refuses_the_settings_default():
    with pytest.raises(sc.WeakJWTSecretError):
        _run("production", "changeme-in-production-use-env-var")


def test_production_refuses_a_secret_too_short_to_be_safe():
    # 20 bytes — HS256 wants at least 32. A real value someone typed by hand.
    with pytest.raises(sc.WeakJWTSecretError):
        _run("production", "s3cret-but-too-short")


def test_production_refuses_the_ci_placeholder():
    with pytest.raises(sc.WeakJWTSecretError):
        _run("production", "ci-only-not-a-real-secret")


def test_production_accepts_a_strong_secret():
    _run("production", STRONG)  # no raise


def test_development_tolerates_a_weak_secret():
    # Local and CI run this way; blocking them would only get in the way.
    _run("development", "super-secure-secret-key")  # no raise


def test_case_and_whitespace_do_not_smuggle_a_weak_value_past_it():
    # Environment is compared case-insensitively; a stray capital must not turn
    # the guard off in production.
    with pytest.raises(sc.WeakJWTSecretError):
        _run("Production", "changeme")


def test_vercel_env_alone_marks_production_even_without_the_app_setting(monkeypatch):
    # The important case: nobody set the app's ENVIRONMENT, but Vercel says this
    # is a production deployment. The guard must still bite — that gap is how a
    # placeholder reached production the first time.
    monkeypatch.setenv("VERCEL_ENV", "production")
    with pytest.raises(sc.WeakJWTSecretError):
        _run("development", "super-secure-secret-key")


def test_vercel_preview_with_a_weak_secret_is_allowed(monkeypatch):
    # Preview deployments are not production; a weak secret there is not worth
    # blocking a deploy over.
    monkeypatch.setenv("VERCEL_ENV", "preview")
    _run("development", "super-secure-secret-key")  # no raise
