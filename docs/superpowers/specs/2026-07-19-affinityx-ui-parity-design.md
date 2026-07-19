# AffinityX UI parity — design

**Date:** 2026-07-19  
**Status:** Approved in conversation (Approach A / port 4 UI pieces)  
**Reference:** `/Users/karthik_eswaran/Downloads/AffinityX-QR-main 2`  
**Goal:** Match the friend’s UI for four items only, without changing login, APIs (except status update wiring), save flow, design editor behaviour, or other pages.

---

## Scope

### In scope

1. **High-resolution QR downloads** — raster downloads at 2048×2048  
2. **“QR is Active” switch** — details modal for Dynamic QRs; real status on list/cards  
3. **Card grid on dashboard** — default card view + card/table toggle (remembered)  
4. **Dynamic toggle rules** — verify Text / Wi‑Fi / Email / SMS / Phone / Location stay Static-only (no behaviour change expected)

### Out of scope

- Login / auth  
- Create-flow field logic beyond verifying toggle visibility  
- Design editor colours, patterns, frames  
- Payments, FAQ, account, integrations  
- Replacing entire pages wholesale from the reference project  

---

## Approach

**Port UI pieces from the reference into the current project** (Approach 1). Keep existing React Query + REST hooks. Do not switch the dashboard back to localStorage-only data.

---

## 1. High-resolution QR downloads

**File:** `src/components/QRView.jsx`

**Behaviour (match reference):**

- On-screen preview keeps the same `size` prop (36–220px depending on screen).  
- For **SVG** download: use the on-screen instance (vector; resolution-independent).  
- For **PNG / JPEG / WEBP**: build a temporary `QRCodeStyling` instance with `buildQRConfig(record, 2048)` and download from that.  

**Constant:** `DOWNLOAD_SIZE = 2048`

**No change** to `buildQRConfig` API or call sites’ preview sizes.

---

## 2. “QR is Active” status

### UI (match reference `Dashboard.jsx`)

- Add `StatusIndicator` — green “Active” / muted “Inactive” with dot.  
- Replace hardcoded “Active” in table row, mobile card, grid card, and details modal with `row.status`.  
- In **QrModal**, for Dynamic QRs only (`qrType` normalises to `Dynamic QR`):
  - Show a bordered row with label **“QR is Active”** / **“QR is Inactive”** and helper text.  
  - `Toggle` switches status between `'Active'` and `'Inactive'`.  
- Static QRs: **no** Active toggle (content is baked in).

### Data / API

Reference used localStorage `setQRStatus`. This project uses the real API.

**Plan:**

- Add `useSetQrStatus` in `src/hooks/useQrs.ts` (or a small dedicated hook).  
- Mutation input: `{ id, typeKey, status: 'Active' | 'Inactive' }`.  
- Call the existing type-specific update endpoint with payload `{ status: status !== 'Inactive' }` (boolean), using `typeKey` to pick the right `update*` API (same routing idea as `useSaveQr`).  
- Optimistically update the `['qrs']` query cache and the open modal row; invalidate / rollback on error.  

If a type’s update endpoint rejects a status-only body, fall back to sending the full mapped update payload with the new status (reuse existing mappers). Prefer status-only first to avoid accidental content overwrites.

---

## 3. Card grid dashboard

**File:** `src/pages/Dashboard.jsx` (port layout from reference; keep `useQrs` / `useDeleteQr`)

**View modes:**

- `'card'` | `'table'`  
- Persist in `localStorage` key `affinityx.dashboardView`  
- Default: `'card'` on desktop (`matchMedia min-width 768`), `'table'` on smaller screens until the user picks  

**UI pieces to add/port:**

- `ViewToggle` (card vs table icons) next to All / Dynamic / Static filters  
- `QrGridCard` — content type, ⋮ menu, 104px QR in 124×124 frame, name, short URL + copy, Dynamic/Static badge, status, scans, Download button  
- `SkeletonCard` for loading  
- When `view === 'card'`: responsive grid `grid-cols-1 sm:2 lg:3 2xl:4`  
- When `view === 'table'`: existing desktop table + mobile `QrCard` list  

Keep search, filters, infinite scroll / batch load, delete, edit navigation, and modal open behaviour.

---

## 4. Dynamic toggle on create (verify only)

**Already correct** in this project via `qrEncoders.js` + `CreateDetails.jsx`:

| Types | UI |
|-------|-----|
| Text, Wi‑Fi, Email, SMS, Phone, Location | No toggle — “Static QR — content is encoded directly” |
| vCard, App, Link Tree, Coupon | Toggle locked ON |
| Website URL and other `dynamicCapable` types | Editable toggle |

**Action:** Spot-check Text (and one other static type) after UI work. Change encoder flags **only** if something regressed.

---

## Files expected to change

| File | Change |
|------|--------|
| `src/components/QRView.jsx` | High-res raster download |
| `src/pages/Dashboard.jsx` | Cards, view toggle, status UI, Active switch |
| `src/hooks/useQrs.ts` (and possibly small API helpers) | `useSetQrStatus` |
| `src/components/ui.jsx` | Use existing `Toggle` if already present |
| `src/pages/CreateDetails.jsx` / `qrEncoders.js` | Verify only |

---

## Success criteria

1. Downloaded PNG of a QR looks sharp (not pixelated like a 148px preview).  
2. Opening a Dynamic QR details modal shows “QR is Active”; turning it off shows Inactive on the card/list after refresh.  
3. Dashboard defaults to a card grid on desktop; card/table toggle works and is remembered.  
4. Creating a Text QR still has **no** Dynamic toggle.  
5. Login, create, save, delete, and design editor still work as before.

---

## Risks / notes

- Status update depends on backend accepting `status` on type update endpoints (payload type already allows `status?: boolean`).  
- Porting large chunks of `Dashboard.jsx` must preserve API-backed list (`useQrs`) and numeric `id` for delete/edit — do not reintroduce localStorage `getQRs` for the live list.
