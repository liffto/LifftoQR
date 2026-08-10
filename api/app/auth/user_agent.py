"""Turn a User-Agent header into a device label people recognise.

Deliberately a small heuristic rather than a UA-parsing dependency: this only
feeds a "which of my devices is this?" list, where being roughly right ("iPhone
· Safari") is enough and a wrong guess costs nothing.
"""

from __future__ import annotations

# Ordered: the first match wins, so specific devices precede the families they
# belong to (iPad before Macintosh, Android tablets before Android phones).
_DEVICES: tuple[tuple[str, str, str], ...] = (
    ("ipad", "tablet", "iPad"),
    ("iphone", "mobile", "iPhone"),
    ("ipod", "mobile", "iPod"),
    # Android phones carry "Mobile"; tablets omit it.
    ("android.*mobile", "mobile", "Android phone"),
    ("android", "tablet", "Android tablet"),
    ("windows phone", "mobile", "Windows Phone"),
    ("macintosh|mac os x", "desktop", "Mac"),
    ("windows nt", "desktop", "Windows PC"),
    ("cros", "desktop", "Chromebook"),
    ("linux", "desktop", "Linux PC"),
)

# Browser sniffing order matters: Edge/Opera/Brave all claim Chrome, and Chrome
# claims Safari, so the impostors have to be checked first.
_BROWSERS: tuple[tuple[str, str], ...] = (
    ("edg/", "Edge"),
    ("opr/|opera", "Opera"),
    ("samsungbrowser", "Samsung Internet"),
    ("firefox|fxios", "Firefox"),
    ("chrome|crios", "Chrome"),
    ("safari", "Safari"),
)


def _match(patterns, haystack: str):
    import re

    for pattern, *rest in patterns:
        if re.search(pattern, haystack):
            return rest
    return None


def parse_user_agent(user_agent: str | None) -> tuple[str, str, str | None]:
    """Return (device_type, device_name, browser) for a User-Agent string."""
    ua = (user_agent or "").lower()
    if not ua:
        return "desktop", "Unknown device", None

    device = _match(_DEVICES, ua)
    device_type, device_name = device if device else ("desktop", "Unknown device")

    browser_match = _match(_BROWSERS, ua)
    browser = browser_match[0] if browser_match else None

    return device_type, device_name, browser


def client_ip(request) -> str | None:
    """Best-effort client IP, honouring the proxy header Vercel sets."""
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        # Left-most entry is the original client; the rest are proxies.
        return forwarded.split(",")[0].strip()[:64] or None
    return getattr(getattr(request, "client", None), "host", None)
