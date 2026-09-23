// Small localStorage helpers: the in-progress "draft" for the create flow,
// saved design templates, and the post-login redirect. QR records themselves
// live in the API, not here.

const KEYS = {
  draft: 'liffto.draft',
  templates: 'liffto.templates',
  pendingRedirect: 'liffto.pendingRedirect',
}

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

// ---- auth (delegates to session service) --------------------------------

import {
  getUser as getSessionUser,
  getAccessToken,
  getRefreshToken,
} from '../services/session'

export const getUser = getSessionUser
export { getAccessToken, getRefreshToken }

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

/**
 * Date *and* time, for when a code was created.
 *
 * The time is the point: two codes made the same afternoon show the same date
 * and are otherwise indistinguishable. Returns an em dash rather than
 * "Invalid Date" for a missing value — a code created before the field
 * existed has none, and that is not an error to show someone.
 */
export const formatDateTime = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

// Short-link host for Dynamic QRs (display + encode). Override via VITE_SHORT_URL_DOMAIN.
const rawShortDomain =
  (typeof import.meta !== 'undefined' &&
    import.meta.env?.VITE_SHORT_URL_DOMAIN) ||
  'qr-api.liffto.in'
export const SHORT_HOST = String(rawShortDomain)
  .replace(/^https?:\/\//i, '')
  .replace(/\/$/, '')
export const SHORT_BASE_URL = `https://${SHORT_HOST}`
export const shortUrl = (slug) => `${SHORT_HOST}/${slug}`
export const shortUrlAbsolute = (slug) =>
  slug ? `${SHORT_BASE_URL}/${slug}` : SHORT_BASE_URL

// ---- templates -----------------------------------------------------------
//
// Saved templates now live on the account — see api/qrcode/userTemplates. What
// is left here is only the old local copy, kept readable so anything saved
// before the move can be lifted to the server on the next visit rather than
// silently stranded in a browser nothing reads any more.

export const getTemplates = () => read(KEYS.templates, [])

export const clearLocalTemplates = () => {
  try {
    localStorage.removeItem(KEYS.templates)
  } catch {
    /* storage unavailable — nothing to clear */
  }
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
