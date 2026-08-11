# Architecture

A high-level map of how Liffto QR is put together.

## Overview

Liffto QR is a React single-page app talking to a FastAPI service backed by
PostgreSQL. Both deploy to Vercel as separate projects from this repository.

The API does double duty: it serves the authenticated app **and** the public
short links that QR codes point at, which is why scanning is a first-class
concern rather than an endpoint tacked on the side.

```
   Browser (React SPA)                     Phone camera
          │                                     │
          │ JSON + JWT                          │ scans a code
          ▼                                     ▼
 ┌──────────────────────────────────────────────────────────┐
 │                      FastAPI (api/)                       │
 │                                                           │
 │   /api/v1/*           authenticated app + public reads    │
 │   /{slug}             short-link scan → redirect          │
 │   /ws/qr/{slug}       live scan counts                    │
 └───────────────────────────┬───────────────────────────────┘
                             │
                             ▼
                       PostgreSQL
```

## Backend layering

Each resource follows the same chain, wired together by FastAPI's dependency
injection in `app/dependencies/dependencies.py`:

```
route  →  controller  →  service  →  repository  →  model
```

| Layer          | Path                 | Responsibility                                                       |
| -------------- | -------------------- | -------------------------------------------------------------------- |
| Route          | `app/routes/`        | Path, method, auth dependency. No logic.                             |
| Controller     | `app/controllers/`   | Translates between HTTP and the service; owns status codes.          |
| Service        | `app/services/`      | Business rules — scan handling, notifications, vCard generation.     |
| Repository     | `app/repositories/`  | All database access. Nothing above this layer writes SQL.            |
| Model / Schema | `app/models/`, `app/schemas/` | SQLAlchemy tables and the Pydantic request/response contract. |

A single factory wires one chain, so swapping an implementation touches one line:

```python
def get_website_controller(db: Session = Depends(get_db)) -> WebsiteController:
    return WebsiteController(WebsiteService(WebsiteRepository(db)))
```

`app/auth/` sits slightly apart — it owns Google sign-in, JWT issuing, sessions
and the profile, and keeps its own models, schemas and router.

## The QR data model

One `qrs` row is the spine of every code: name, slug, type, dynamic flag, scan
count. Its type-specific payload lives in a **separate table per type**
(`websites`, `vcards`, `wifi`, `events`, …), joined one-to-one, alongside a
`templates` row holding the visual design.

That is why `QrRepository` eager-loads every content relationship at once: a
listing has no idea which type each row will turn out to be, and lazy loading
would mean a query per code.

## How a scan resolves

Scanning is the one path where a stranger, not a signed-in user, drives the
system — so it has to stay fast and must never fail closed.

1. The camera opens `https://<short-domain>/<slug>`, hitting `scan_routes`
2. Inactive or unknown slugs stop here
3. Dynamic codes increment their scan count and broadcast it over the
   WebSocket, so an open dashboard updates live
4. An in-app notification is recorded for the owner, if they have scan alerts
   on. **Best-effort**: a failure here is swallowed, because whoever scanned is
   waiting on a redirect and should not see an error from a feature that is not
   theirs
5. If the code resolves to a destination, redirect to it
6. Otherwise redirect to `/s/<slug>` on the frontend — the public landing page
   that renders contact cards, Wi-Fi credentials, events, and so on

Static codes never reach the backend at all; their content lives in the image.

## Frontend layering

| Path              | Responsibility                                                                                              |
| ----------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/pages/`      | Route-level screens. Own page state, orchestrate components.                                                 |
| `src/components/` | Reusable UI. `QRView` is the one stateful piece — it bridges React and the imperative `qr-code-styling` API.  |
| `src/hooks/`      | TanStack Query hooks. Server state lives here, not in component state.                                       |
| `src/api/`        | Typed clients per resource, over a shared axios instance that attaches the JWT and refreshes it on a 401.     |
| `src/context/`    | Auth session and the login dialog, both app-wide.                                                            |
| `src/lib/`        | Pure logic: QR encoders per type, `qr.js` design → render options, country dial codes and validation.        |
| `src/middleware/` | Route guards.                                                                                                |

### Where state lives

- **Server state** — QR codes, devices, notifications, profile — is owned by
  TanStack Query and refetched, never mirrored into component state
- **Session** — tokens and the cached user — is in `localStorage` under
  `liffto.session`, read through `src/services/session.ts`
- **`localStorage` otherwise holds only** the in-progress create draft, saved
  design templates, and the post-login redirect. It used to hold the QR records
  themselves; it no longer does

## Key decisions

- **`QRView` keeps a referentially-stable holder element.** `qr-code-styling`
  injects an `<svg>` by direct DOM manipulation. Memoizing the holder so it is
  never remounted keeps React's reconciler out of that subtree and avoids
  `removeChild`/`insertBefore` crashes when the frame wrapper changes.
- **Raster downloads render a throwaway high-resolution instance.** The
  on-screen QR can be a 36px thumbnail; exporting it directly would produce a
  pixelated file.
- **iOS gets contact cards through the Share Sheet.** Safari ignores the
  `<a download>` trick for blob URLs, so downloads route through the Web Share
  API there, and the `.vcf` is served from a real URL with
  `Content-Type: text/vcard` — the combination iOS actually follows into
  Contacts.
- **Sessions are keyed on the refresh token's `jti`.** The refresh endpoint
  re-issues only the access token, so that id is stable for the life of a login
  and identifies a device. Revoking pushes it onto the token blocklist.
- **Signing a device out takes effect on its next request.** Two things are
  revoked together: the session's *refresh* token goes on the blocklist so the
  device cannot renew, and the session itself is marked revoked. Every
  authenticated request checks both — the access token's own `jti` against the
  blocklist, and the session id (`sid`) the token was issued for. The `sid`
  check is what closes the gap, because the access token in a removed device's
  hands carries a different `jti` that was never blocklisted and would
  otherwise keep working until it expired.
- **Tokens predating device tracking carry no `sid`** and are accepted rather
  than invalidated wholesale, so shipping this did not sign everyone out.
- **A top-level `ErrorBoundary`** keeps a render error in one view from blanking
  the whole app.

## Migrations

Schema changes are Alembic revisions in `api/migrations/versions/`. Nothing runs
them automatically — **Vercel does not** — so they have to be applied against
the target database by hand:

```bash
cd api && source venv/bin/activate
alembic revision -m "describe change"
alembic upgrade head
```
