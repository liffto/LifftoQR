"""Build a downloadable vCard 3.0 file from a stored vCard QR.

Served as a real `text/vcard` response rather than generated in the browser:
iOS Safari only reliably hands a contact to the Contacts app when it arrives
as a genuine file download with the right MIME type, so a JS Blob/data-URL
"Save Contact" silently does nothing there.

The uploaded photo is deliberately not embedded. Base64-encoding it made up
96% of the file (40KB of 42KB), and Android's importer renders that payload as
visible text in the contact preview rather than as a picture — so the photo
cost a slow download on mobile data and showed up as a wall of characters.
The card still displays it on the landing page; only the saved contact goes
without.
"""

from __future__ import annotations

import re


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
