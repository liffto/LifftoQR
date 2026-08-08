// Lightweight localStorage-backed store for the AFFINITYX QR prototype.
// Holds the QR records shown on the dashboard, the auth flag, and the
// in-progress "draft" used by the two-step create flow.

const KEYS = {
  qrs: 'affinityx.qrs',
  auth: 'affinityx.auth',
  draft: 'affinityx.draft',
  seedVersion: 'affinityx.seedVersion',
  templates: 'affinityx.templates',
  pendingRedirect: 'affinityx.pendingRedirect',
}

// Bump to re-seed the dashboard with a fresh dataset on next load.
const SEED_VERSION = 2

const read = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

const write = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value))
}

// ---- ids / slugs ---------------------------------------------------------

const ALPHABET =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

export const randomSlug = (len = 6) => {
  let out = ''
  for (let i = 0; i < len; i++) {
    out += ALPHABET[Math.floor(Math.random() * ALPHABET.length)]
  }
  return out
}

export const uid = () => `qr_${Date.now().toString(36)}_${randomSlug(4)}`

// ---- defaults ------------------------------------------------------------

export const defaultDesign = () => ({
  logo: null, // null | a key from LOGO_OPTIONS | a data URL string
  logoSize: 0.4, // 0.2 .. 0.6 (fraction of qr size)
  frame: 'none',
  frameText: 'SCAN ME',
  bodyPattern: 'square', // see PATTERN_OPTIONS in lib/qr.js
  bodyGradient: false,
  bodyColor1: '#000000',
  bodyColor2: '#000000',
  cornerStyle: 0, // index into CORNER_OPTIONS
  cornerGradient: false,
  cornerColor1: '#000000',
  cornerColor2: '#000000',
  background: '#FFFFFF',
})

const seedDate = '2025-10-28'

const makeSeed = () => {
  const base = (over = {}) => ({
    id: uid(),
    name: 'www.cyberdine.in',
    type: 'URL',
    url: 'https://www.cyberdine.in',
    slug: 'aehtj8',
    dynamic: true,
    qrType: 'Dynamic QR',
    folder: 'Untitled',
    editedOn: seedDate,
    status: 'Active',
    scans: 100,
    design: defaultDesign(),
    ...over,
  })
  // A larger, varied dataset so the dashboard's infinite scroll has something
  // to page through.
  const pattern = [
    { qrType: 'Dynamic QR', dynamic: true, scans: 100 },
    { qrType: 'Dynamic QR', dynamic: true, scans: 0 },
    { qrType: 'Statistic', dynamic: false, scans: 100 },
    { qrType: 'Statistic', dynamic: false, scans: 100 },
    { qrType: 'Statistic', dynamic: false, scans: 100 },
    { qrType: 'Dynamic QR', dynamic: true, scans: 100 },
  ]
  return Array.from({ length: 24 }, (_, i) =>
    base({ ...pattern[i % pattern.length], slug: randomSlug() }),
  )
}

// ---- public api ----------------------------------------------------------

export const getQRs = () => {
  let list = read(KEYS.qrs, null)
  const version = read(KEYS.seedVersion, 0)
  if (!list || version !== SEED_VERSION) {
    list = makeSeed()
    write(KEYS.qrs, list)
    write(KEYS.seedVersion, SEED_VERSION)
  }
  return list
}

export const getQR = (id) => getQRs().find((q) => q.id === id) || null

export const saveQR = (record) => {
  const list = getQRs()
  const idx = list.findIndex((q) => q.id === record.id)
  const next = { ...record, editedOn: todayISO() }
  if (idx >= 0) list[idx] = next
  else list.unshift(next)
  write(KEYS.qrs, list)
  return next
}

export const deleteQR = (id) => {
  const list = getQRs().filter((q) => q.id !== id)
  write(KEYS.qrs, list)
  return list
}

export const duplicateQR = (id) => {
  const src = getQR(id)
  if (!src) return null
  const copy = {
    ...src,
    id: uid(),
    slug: randomSlug(),
    name: `${src.name} (copy)`,
    scans: 0,
    editedOn: todayISO(),
  }
  const list = getQRs()
  list.unshift(copy)
  write(KEYS.qrs, list)
  return copy
}

// ---- draft (create flow) -------------------------------------------------

export const getDraft = () => read(KEYS.draft, null)
export const setDraft = (draft) => write(KEYS.draft, draft)
export const clearDraft = () => localStorage.removeItem(KEYS.draft)

// Where to send the user after signing in — set when a visitor starts a QR on
// the public landing page and has to authenticate to continue.
export const setPendingRedirect = (path) => {
  if (
    typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//')
  )
    write(KEYS.pendingRedirect, path)
}
export const takePendingRedirect = () => {
  const path = read(KEYS.pendingRedirect, null)
  localStorage.removeItem(KEYS.pendingRedirect)
  return typeof path === 'string' &&
    path.startsWith('/') &&
    !path.startsWith('//')
    ? path
    : null
}
export const hasPendingRedirect = () => !!read(KEYS.pendingRedirect, null)

// ---- auth (delegates to session service) --------------------------------

import {
  getUser as getSessionUser,
  clearUser,
  getAccessToken,
  getRefreshToken,
} from '../services/session'

export const getUser = getSessionUser
export const signOut = clearUser
export { getAccessToken, getRefreshToken }
export const isAuthed = () => Boolean(getAccessToken() && getSessionUser())

// ---- helpers -------------------------------------------------------------

export const todayISO = () => new Date().toISOString().slice(0, 10)

export const formatDate = (iso) => {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  } catch {
    return iso
  }
}

// Short-link host for Dynamic QRs (display + encode). Override via VITE_SHORT_URL_DOMAIN.
const rawShortDomain =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_SHORT_URL_DOMAIN) ||
  'liffto-qr.vercel.app'
export const SHORT_HOST = String(rawShortDomain)
  .replace(/^https?:\/\//i, '')
  .replace(/\/$/, '')
export const SHORT_BASE_URL = `https://${SHORT_HOST}`
export const shortUrl = (slug) => `${SHORT_HOST}/${slug}`
export const shortUrlAbsolute = (slug) =>
  slug ? `${SHORT_BASE_URL}/${slug}` : SHORT_BASE_URL

// ---- templates -----------------------------------------------------------

export const getTemplates = () => read(KEYS.templates, [])

export const saveUserTemplate = (tpl) => {
  const list = getTemplates().filter((t) => t.label !== tpl.label)
  const next = [tpl, ...list]
  write(KEYS.templates, next)
  return next
}

export const deleteUserTemplate = (label) => {
  const list = getTemplates().filter((t) => t.label !== label)
  write(KEYS.templates, list)
}

// ---- clipboard helper ----------------------------------------------------

export const copyToClipboard = async (text) => {
  if (navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(text)
      return
    } catch (_) {
      // clipboard API blocked — fall through to execCommand
    }
  }
  const el = document.createElement('textarea')
  el.value = text
  el.style.cssText = 'position:fixed;top:-9999px;left:-9999px;opacity:0'
  document.body.appendChild(el)
  el.focus()
  el.select()
  try {
    document.execCommand('copy')
  } catch {
    // execCommand unsupported — nothing else to try
  }
  document.body.removeChild(el)
}
