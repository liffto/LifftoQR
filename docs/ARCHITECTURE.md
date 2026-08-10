# Architecture

A high-level map of how Liffto QR is put together.

## Overview

Liffto QR is a **client-only single-page application**. There is no backend in
the prototype — all state lives in the browser via `localStorage`. Swapping the
data layer for a real API is the primary path to production (see Roadmap).

```
┌─────────────────────────────────────────────────────────────┐
│                          App.jsx                             │
│   Routes + auth guard + top-level <ErrorBoundary>            │
└───────┬───────────────┬───────────────┬─────────────────────┘
        │               │               │
   /login          /dashboard      /create → /create/design
   Login.jsx       Dashboard.jsx   CreateUrl.jsx   DesignQR.jsx
        │               │               │               │
        └───────────────┴───────┬───────┴───────────────┘
                                 │
                 ┌───────────────┴───────────────┐
                 │           src/lib              │
                 │  store.js  → localStorage CRUD │
                 │  qr.js     → design → QR config│
                 └───────────────┬───────────────┘
                                 │
                       components/QRView.jsx
                  (wraps qr-code-styling, live render)
```

## Layers

| Path               | Responsibility                                                                                                                                |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/pages/`       | Route-level screens. Own their page state and orchestrate components.                                                                         |
| `src/components/`  | Reusable, mostly-presentational UI. `QRView` is the one stateful piece (it bridges React and the imperative `qr-code-styling` library).       |
| `src/lib/store.js` | The data layer: QR records, auth flag, and the in-progress "draft", all persisted to `localStorage`. The seam to replace with a real backend. |
| `src/lib/qr.js`    | Maps a `design` object to `qr-code-styling` options and exposes the option metadata (patterns, corners, frames, logos) the UI renders from.   |

## Key decisions

- **`QRView` uses a referentially-stable holder element.** `qr-code-styling`
  injects an `<svg>` via direct DOM manipulation. To keep React's reconciler
  away from that subtree, the holder element is memoized and never remounted —
  preventing `removeChild`/`insertBefore` crashes when the frame wrapper changes.
- **A top-level `ErrorBoundary`** ensures a render error in one view degrades
  gracefully instead of blanking the whole app.
- **Margins scale with QR size** so small dashboard thumbnails don't collapse to
  a zero-size module grid.

## Replacing the data layer

Every read/write goes through `src/lib/store.js`. To add a backend, reimplement
those functions (`getQRs`, `saveQR`, `getDraft`, etc.) against your API while
keeping their signatures stable — no page or component changes required.
