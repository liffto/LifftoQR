"""Build a downloadable vCard 3.0 file from a stored vCard QR.

Served as a real `text/vcard` response rather than generated in the browser:
iOS Safari only reliably hands a contact to the Contacts app when it arrives
as a genuine file download with the right MIME type, so a JS Blob/data-URL
"Save Contact" silently does nothing there.
"""

from __future__ import annotations

import base64
import binascii
import re

# Data URLs the browser produced for the photo/logo uploads.
_DATA_URL_RE = re.compile(
    r"^data:image/(?P<subtype>png|jpe?g|gif|webp);base64,(?P<data>[A-Za-z0-9+/=\s]+)$",
    re.IGNORECASE,
)

# vCard 3.0 image type tokens keyed by the data-URL subtype.
_IMAGE_TYPES = {
    "png": "PNG",
    "jpg": "JPEG",
    "jpeg": "JPEG",
    "gif": "GIF",
    "webp": "WEBP",
}


def _escape(value: str | None) -> str:
    """Escape per RFC 2426: backslash, newline, comma and semicolon."""
    if value is None:
        return ""
    return (
        str(value)
        .replace("\\", "\\\\")
        .replace("\r\n", "\\n")
        .replace("\n", "\\n")
        .replace("\r", "\\n")
        .replace(",", "\\,")
        .replace(";", "\\;")
    )


def _fold(line: str) -> str:
    """Fold a long content line to 75 octets, continuations prefixed with a space."""
    if len(line) <= 75:
        return line
    chunks = [line[:75]]
    rest = line[75:]
    while rest:
        chunks.append(" " + rest[:74])
        rest = rest[74:]
    return "\r\n".join(chunks)


def _photo_line(data_url: str | None) -> str | None:
    """Embed an uploaded photo so the saved contact keeps its picture."""
    if not data_url:
        return None
    match = _DATA_URL_RE.match(data_url.strip())
    if not match:
        return None
    subtype = match.group("subtype").lower()
    payload = re.sub(r"\s+", "", match.group("data"))
    try:
        # Round-trip so a corrupt upload can't emit a broken .vcf.
        base64.b64decode(payload, validate=True)
    except (binascii.Error, ValueError):
        return None
    image_type = _IMAGE_TYPES.get(subtype, "JPEG")
    return _fold(f"PHOTO;ENCODING=b;TYPE={image_type}:{payload}")


def build_vcard(vcard) -> str:
    """Render a `Vcard` row as a vCard 3.0 document."""
    first = (vcard.first_name or "").strip()
    last = (vcard.last_name or "").strip()
    full_name = " ".join(p for p in (first, last) if p)

    lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        f"N:{_escape(last)};{_escape(first)};;;",
        f"FN:{_escape(full_name)}",
    ]

    if vcard.org:
        lines.append(f"ORG:{_escape(vcard.org)}")
    if vcard.title:
        lines.append(f"TITLE:{_escape(vcard.title)}")
    if vcard.phone:
        lines.append(f"TEL;TYPE=CELL,VOICE:{_escape(vcard.phone)}")
    if vcard.work_phone:
        lines.append(f"TEL;TYPE=WORK,VOICE:{_escape(vcard.work_phone)}")
    if vcard.email:
        lines.append(f"EMAIL;TYPE=INTERNET:{_escape(vcard.email)}")
    if vcard.url:
        lines.append(f"URL:{_escape(vcard.url)}")

    if any((vcard.street, vcard.city, vcard.state, vcard.zip, vcard.country)):
        lines.append(
            "ADR;TYPE=HOME:;;"
            f"{_escape(vcard.street)};"
            f"{_escape(vcard.city)};"
            f"{_escape(vcard.state)};"
            f"{_escape(vcard.zip)};"
            f"{_escape(vcard.country)}"
        )

    photo = _photo_line(vcard.photo)
    if photo:
        lines.append(photo)

    if vcard.note:
        lines.append(f"NOTE:{_escape(vcard.note)}")

    lines.append("END:VCARD")
    return "\r\n".join(lines) + "\r\n"


def vcard_filename(vcard) -> str:
    """A safe ASCII filename for the download, e.g. 'jane-doe.vcf'."""
    name = " ".join(
        p for p in ((vcard.first_name or "").strip(), (vcard.last_name or "").strip()) if p
    )
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", name).strip("-").lower()
    return f"{slug or 'contact'}.vcf"
