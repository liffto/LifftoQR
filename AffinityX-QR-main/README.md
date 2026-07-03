<div align="center">

# Affinityx QR

**Design, customize, and manage dynamic & static QR codes — with logos, gradients, frames, custom patterns, and a full management dashboard.**

[![CI](https://github.com/<your-username>/affinityx-qr/actions/workflows/ci.yml/badge.svg)](https://github.com/<your-username>/affinityx-qr/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
![React](https://img.shields.io/badge/React-18-61dafb.svg)
![Vite](https://img.shields.io/badge/Vite-5-646cff.svg)

</div>

---

## 📖 Overview

Affinityx QR is a client-side web app for creating richly styled QR codes through a guided, two-step flow, then managing them from a searchable dashboard. It supports **dynamic QR codes** (editable destination + scan statistics) and **static QR codes**, live-previewing every design change in real time.

> Replace this section with your own product positioning, target users, and the problem it solves.

## ✨ Features

- **Two-step create flow** — enter a URL, then design the code.
- **Live styling** — body patterns, corner styles, gradient colors, embedded logos (brand presets or your own upload), and frames.
- **Dynamic vs. static QR** — short links with editability + statistics, or fixed-destination codes.
- **Management dashboard** — search, filter, infinite scroll with shimmer loading, duplicate/delete, and copy-link.
- **Multi-format export** — download as PNG, JPEG, SVG, or WEBP.
- **Auth flow** — Google sign-in screen + email/password (mocked for the prototype).

## 🎬 Demo

> Add a screenshot or GIF here (e.g. `docs/images/dashboard.png`).

## 🧰 Tech Stack

| Layer         | Choice                                                                                          |
| ------------- | ----------------------------------------------------------------------------------------------- |
| UI library    | [React 18](https://react.dev/)                                                                  |
| Build tool    | [Vite 5](https://vitejs.dev/)                                                                   |
| Styling       | [Tailwind CSS 3](https://tailwindcss.com/)                                                      |
| Routing       | [React Router 6](https://reactrouter.com/)                                                      |
| QR engine     | [qr-code-styling](https://github.com/kozakdenys/qr-code-styling)                                |
| Icons         | [lucide-react](https://lucide.dev/) · [react-icons](https://react-icons.github.io/react-icons/) |
| Lint / format | ESLint 9 · Prettier 3                                                                           |
| Tests         | Vitest · Testing Library                                                                        |

## ✅ Prerequisites

- **Node.js ≥ 18** and npm (or pnpm/yarn)

## 🚀 Installation

```bash
# 1. Clone
git clone https://github.com/<your-username>/affinityx-qr.git
cd affinityx-qr

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev          # → http://localhost:5173
```

## ⚙️ Configuration

This is a fully client-side app, so configuration is optional. Copy the example file if you want to override defaults:

```bash
cp .env.example .env
```

| Variable                | Default         | Description                           |
| ----------------------- | --------------- | ------------------------------------- |
| `VITE_APP_NAME`         | `Affinityx QR`  | App name shown in the UI              |
| `VITE_SHORT_URL_DOMAIN` | `affinityx.com` | Domain used for generated short links |

> ⚠️ **Vite exposes any `VITE_`-prefixed variable to the browser bundle.** Never put real secrets or API keys in client-side env vars — they ship to every visitor.

## ▶️ Usage

```bash
npm run dev          # local dev with HMR
npm run build        # production build → dist/
npm run preview      # preview the production build locally
npm run lint         # lint with ESLint
npm run format       # auto-format with Prettier
npm run test         # run unit tests with Vitest
```

**Typical flow:** sign in → **Create QR** → enter a URL & toggle Dynamic → **Design** (logo, pattern, corners, colors, frame) → **Download & Save** → manage it on the dashboard.

## 🗂️ Project Structure

```text
affinityx-qr/
├── public/              # static assets served as-is (favicon, etc.)
├── src/
│   ├── assets/          # imported images & static assets
│   ├── components/      # reusable UI (QRView, Logo, ui primitives, ErrorBoundary)
│   ├── pages/           # route-level screens (Login, Dashboard, CreateUrl, DesignQR)
│   ├── lib/             # core logic & data layer (qr.js engine, store.js persistence)
│   ├── hooks/           # custom React hooks
│   ├── App.jsx          # routes + auth guard
│   ├── main.jsx         # app entrypoint
│   └── index.css        # Tailwind directives + global styles
├── tests/               # Vitest unit/component tests
├── docs/                # documentation (architecture, etc.)
├── .github/workflows/   # CI pipeline
└── <root configs>       # vite, tailwind, eslint, prettier, etc.
```

## 🧪 Testing

```bash
npm run test         # single run
npm run test:watch   # watch mode
```

## 📦 Deployment

The build output in `dist/` is fully static — deploy it to any static host (Vercel, Netlify, GitHub Pages, S3/CloudFront, Cloudflare Pages):

```bash
npm run build        # outputs to dist/
```

## 🗺️ Roadmap

- [ ] Real backend + persistence (replace localStorage)
- [ ] Real OAuth (Google) sign-in
- [ ] Scan analytics for dynamic codes
- [ ] TypeScript migration

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE).
