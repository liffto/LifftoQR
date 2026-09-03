"""Identify the device behind a scan without storing who it belongs to.

A scan is a bare GET that ends in a 302, so there is no session, no account and
no device id to read. What there is: the caller's IP and their User-Agent. Both
together are stable enough to tell two phones apart for as long as the phone
keeps its address, which is what a unique-scan figure needs.

Storing them as-is would turn a scan counter into a log of who went where, so
they are not stored. `visitor_hash` is HMAC-SHA256 over IP + User-Agent, keyed
with the app's JWT secret. The hash is stable, so counting distinct visitors
works; it is keyed, so the value cannot be reversed by hashing candidate
addresses; and the inputs are discarded, so the row that remains says "some
device" rather than "this person".
"""

from __future__ import annotations

import hashlib
import hmac

from app.config.settings import settings


def client_ip(headers: dict[str, str] | None, fallback: str | None = None) -> str | None:
    """The caller's address, as far as it can be trusted.

    Behind Vercel the real address is the first entry in x-forwarded-for; the
    rest of the chain is the proxies. Falls back to the socket address for
    direct and local requests.
    """
    if headers:
        forwarded = headers.get("x-forwarded-for") or headers.get("X-Forwarded-For")
        if forwarded:
            first = forwarded.split(",")[0].strip()
            if first:
                return first
        real = headers.get("x-real-ip") or headers.get("X-Real-IP")
        if real:
            return real.strip()
    return fallback


def visitor_hash(ip: str | None, user_agent: str | None) -> str | None:
    """A stable, non-reversible id for this device, or None if there is nothing
    to go on — an anonymous scan still counts, it just cannot be de-duplicated.
    """
    material = f"{ip or ''}|{user_agent or ''}"
    if not material.strip("|"):
        return None
    return hmac.new(
        settings.jwt_secret_key.encode("utf-8"),
        material.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
