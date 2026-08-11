<div align="center">

# Liffto QR

**Design, customize, and manage dynamic & static QR codes — with logos, gradients, frames, custom patterns, scan tracking, and a full management dashboard.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688.svg)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-4169e1.svg)

</div>

---

## 📖 Overview

Liffto QR is a React single-page app backed by a FastAPI service and PostgreSQL. You create a QR code through a guided flow, style it live, and manage it from a searchable dashboard.

Everything is free — there are no plans or paid tiers.

## ✨ Features

**Creating**

- Twenty QR types — website, contact card, Wi-Fi, event, location, PDF, video, link tree, coupon and more
- Live styling: body patterns, corner styles, gradients, embedded logos (brand presets or your own upload) and frames
- Saved design templates
- Clone any existing code into a new draft
- Download as PNG, JPEG, SVG or WEBP

**Dynamic vs static**

- **Dynamic** codes point at a short link you own, so the destination stays editable after printing and every scan is counted
- **Static** codes encode their content directly — nothing to track, nothing that can break

**Scanning**

- Types with a destination (website, PDF, video) redirect straight through
- Types without one (contact card, Wi-Fi, event, text, location) open a branded public landing page
- Contact cards offer one-tap **Save Contact**, served as a real `text/vcard` download so iOS adds it to Contacts

**Account**

- Google sign-in, presented as a dialog over the current page
- Editable profile with country-aware phone validation
- **Manage Devices** — every signed-in session, with the ability to sign any of them out
- **Notifications** — in-app scan alerts, aggregated per code per day

## 🧰 Tech Stack

| Layer          | Choice                                                                                          |
| -------------- | ----------------------------------------------------------------------------------------------- |
| UI library     | [React 18](https://react.dev/)                                                                  |
| Build tool     | [Vite 5](https://vitejs.dev/)                                                                   |
| Styling        | [Tailwind CSS 3](https://tailwindcss.com/)                                                      |
| Routing        | [React Router 6](https://reactrouter.com/)                                                      |
| Server state   | [TanStack Query 5](https://tanstack.com/query)                                                  |
| QR engine      | [qr-code-styling](https://github.com/kozakdenys/qr-code-styling)                                |
| Icons          | [lucide-react](https://lucide.dev/) · [react-icons](https://react-icons.github.io/react-icons/) |
| API            | [FastAPI](https://fastapi.tiangolo.com/) · [SQLAlchemy 2](https://www.sqlalchemy.org/)          |
| Database       | PostgreSQL (hosted on [Neon](https://neon.tech/)) · [Alembic](https://alembic.sqlalchemy.org/)  |
| Auth           | Google OAuth ID tokens → JWT access/refresh pair                                                |
| Lint / format  | ESLint 9 · Prettier 3                                                                           |
| Tests          | Vitest · Testing Library · pytest                                                               |

## ✅ Prerequisites

- **Node.js 20.x** and npm
- **Python 3.10+**
- A **PostgreSQL** database (a free Neon project works well)
- A **Google OAuth client ID and secret** for sign-in

## 🚀 Installation

```bash
git clone https://github.com/liffto/LifftoQR.git
cd LifftoQR
```

**Frontend**

```bash
npm install
npm run dev          # → http://localhost:5173
```

**Backend**

```bash
cd api
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
alembic upgrade head                                    # apply migrations
uvicorn app.main:app --reload --port 8000               # → http://localhost:8000
```

API docs are served at `http://localhost:8000/docs`.

## ⚙️ Configuration

**Frontend** — copy `.env.development` to `.env` and adjust:

| Variable                | Example                  | Description                                  |
| ----------------------- | ------------------------ | -------------------------------------------- |
| `VITE_APP_NAME`         | `Liffto QR`              | App name shown in the UI                     |
| `VITE_SHORT_URL_DOMAIN` | `liffto-qr.vercel.app`   | Domain used for generated short links        |
| `VITE_BACKEND_API_URL`  | `http://localhost:8000`  | Backend origin                               |
| `VITE_WS_BASE_URL`      | `ws://localhost:8000`    | WebSocket origin for live scan counts        |
| `VITE_CLIENT_ID`        | `…apps.googleusercontent.com` | Google OAuth client ID (public)         |

> ⚠️ Vite ships **every** `VITE_`-prefixed variable to the browser bundle. Never put secrets here.

**Backend** — create `api/.env`:

| Variable                      | Description                                                     |
| ----------------------------- | --------------------------------------------------------------- |
| `DATABASE_URL`                | PostgreSQL connection string (required — no default)             |
| `CLIENT_ID` / `CLIENT_SECRET` | Google OAuth credentials                                         |
| `JWT_SECRET_KEY`              | Signing key for access/refresh tokens                            |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Access token lifetime (default 30)                               |
| `FRONTEND_URL`                | Public origin of the web app — CORS **and** scan landing links   |

> `FRONTEND_URL` is not only a CORS entry. Scan redirects for codes without their own destination are built from it, and that link is handed to whoever scanned the code — so pointing it at localhost in production sends every scanner to their own machine.

## ▶️ Usage

```bash
npm run dev          # dev server with HMR
npm run build        # production build → dist/
npm run preview      # preview the production build
npm run lint         # ESLint
npm run format       # Prettier
npm run test         # Vitest
```

```bash
cd api && source venv/bin/activate
pytest -q                                # backend tests
alembic revision -m "describe change"    # new migration
alembic upgrade head                     # apply migrations
```

**Typical flow:** sign in → **Create QR** → pick a type and enter its details → **Design** (logo, pattern, corners, colours, frame) → **Save & Download** → manage it on the dashboard.

## 🔀 How scanning works

A dynamic code encodes `https://<short-domain>/<slug>`, which hits the backend. From there:

1. The scan is counted and broadcast over WebSocket, so an open dashboard updates live
2. An in-app notification is created for the owner, if they have scan alerts on
3. If the code has a destination (a URL, PDF, video…) the backend redirects to it
4. Otherwise it redirects to `/s/<slug>` on the frontend — the public landing page that renders contact cards, Wi-Fi credentials, events and so on

Static codes never touch the backend; the content lives in the image itself.

## 🗂️ Project Structure

```text
LifftoQR/
├── api/                     # FastAPI backend
│   ├── app/
│   │   ├── auth/            # Google sign-in, JWTs, sessions, profile
│   │   ├── controllers/     # request handling per resource
│   │   ├── services/        # business logic (scans, notifications, vCard)
│   │   ├── repositories/    # database access
│   │   ├── models/          # SQLAlchemy tables
│   │   ├── schemas/         # Pydantic request/response models
│   │   └── routes/          # route registration
│   ├── migrations/          # Alembic versions
│   └── tests/               # pytest
├── src/                     # React frontend
│   ├── api/                 # typed API clients
│   ├── components/          # reusable UI (QRView, PhoneInput, Layout…)
│   ├── context/             # auth + login-dialog providers
│   ├── hooks/               # TanStack Query hooks
│   ├── lib/                 # QR encoders, country data, helpers
│   ├── pages/               # route-level screens
│   └── middleware/          # route guards
├── tests/                   # Vitest
└── docs/                    # additional documentation
```

## 🧪 Testing

```bash
npm run test              # frontend, single run
npm run test:watch        # frontend, watch mode
cd api && pytest -q       # backend
```

## 📦 Deployment

Frontend and backend deploy as **two separate Vercel projects** from this one repository — the web app, and the API (which also serves the short links that QR codes point at).

Two things Vercel will not do for you:

1. **Migrations don't run on deploy.** After any schema change, run `alembic upgrade head` against the production database yourself. Deploying code that expects a column you haven't added will break at runtime, not at build time.
2. **Environment variables aren't inherited from this repo.** Set them on each project, `FRONTEND_URL` in particular.

## ⚠️ Known limitations

- **Weekly Summary and Product Updates don't send anything.** Both need email, and no provider is wired up. The preferences persist and the UI labels them accordingly.
- **Device names are approximate.** They come from the User-Agent, so two identical laptops are indistinguishable apart from IP and last-seen time. No IP geolocation, so no city is shown.

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE).
