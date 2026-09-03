// UI-facing QR type registry: the pure schemas/encoders from qrEncoders.js with
// a resolved lucide-react icon component attached for rendering tiles, forms and chips.

import {
  Link2,
  Type,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Share2,
  Star,
  FileText,
  Video,
  Music,
  Smartphone,
  Ticket,
  PartyPopper,
  QrCode,
} from 'lucide-react'
import { ENCODERS, findEncoder } from './qrEncoders'

const ICONS = {
  Link2,
  Type,
  Wifi,
  Contact,
  Mail,
  MessageSquare,
  Phone,
  MessageCircle,
  Calendar,
  MapPin,
  Share2,
  Star,
  FileText,
  Video,
  Music,
  Smartphone,
  Ticket,
  PartyPopper,
}

// Soft icon tints per type so the grid reads visually, not as a wall of grey.
const TINTS = {
  url: 'bg-primary/10 text-primary',
  text: 'bg-slate-100 text-slate-600',
  wifi: 'bg-primary/10 text-primary',
  vcard: 'bg-indigo-50 text-indigo-600',
  email: 'bg-rose-50 text-rose-600',
  sms: 'bg-emerald-50 text-emerald-600',
  phone: 'bg-emerald-50 text-emerald-600',
  whatsapp: 'bg-green-50 text-[#25D366]',
  event: 'bg-amber-50 text-amber-600',
  location: 'bg-red-50 text-red-500',
  social: 'bg-pink-50 text-pink-600',
  'google-review': 'bg-amber-50 text-amber-500',
  pdf: 'bg-red-50 text-red-500',
  video: 'bg-violet-50 text-violet-600',
  mp3: 'bg-fuchsia-50 text-fuchsia-600',
  app: 'bg-sky-50 text-sky-600',
  linktree: 'bg-teal-50 text-teal-600',
  coupon: 'bg-orange-50 text-orange-600',
  invitation: 'bg-purple-50 text-purple-600',
  feedback: 'bg-cyan-50 text-cyan-600',
}

export const QR_TYPES = ENCODERS.map((t) => ({
  ...t,
  Icon: ICONS[t.iconName] || QrCode,
  tint: TINTS[t.key] || 'bg-canvas text-ink-muted',
}))

export const QR_TYPE_MAP = Object.fromEntries(QR_TYPES.map((t) => [t.key, t]))

export const findType = (key) => QR_TYPE_MAP[key] || QR_TYPE_MAP.url

// Types that are no longer offered when creating a code.
//
// Withdrawn from the pickers only. They stay in QR_TYPES and QR_TYPE_MAP on
// purpose, because codes of these types are already out there: the dashboard
// has to name and draw them, the scan page has to render what they contain,
// their edit screens have to keep working, and a printed code cannot be
// recalled. Taking them out of the registry would break all of that — the point
// is to stop offering them, not to pretend they never existed.
const WITHDRAWN_TYPES = new Set([
  'video',
  'mp3',
  'pdf',
  'location',
  'social',
  'google-review',
  'invitation',
])

export const isOfferedType = (key) => !WITHDRAWN_TYPES.has(key)

// Types whose dynamic codes land on our own page instead of redirecting.
//
// Each of these could be turned into a link — mailto:, sms:, tel:, wa.me — and
// a redirect would drop the scanner into a mail client or a dialer without
// showing them the address or the number first. Landing shows them what the
// code holds and hands them a button, which is also the only way the scan is
// worth counting.
//
// Must stay in step with ALWAYS_LANDING_TYPE_KEYS in
// api/app/services/qr_destination.py, which is what actually decides it. This
// copy exists so the create flow can describe the choice and preview the right
// thing; the server has the final say.
const LANDS_ON_PAGE_WHEN_DYNAMIC = new Set([
  'text',
  'email',
  'sms',
  'phone',
  'whatsapp',
])

export const dynamicLandsOnPage = (key) => LANDS_ON_PAGE_WHEN_DYNAMIC.has(key)

// What every type chooser lists. Derived rather than hand-written, so a type
// added later is offered without anyone remembering to add it here, and a type
// withdrawn later disappears from all three pickers at once.
export const SELECTABLE_QR_TYPES = QR_TYPES.filter((t) => isOfferedType(t.key))

// Re-export the pure helpers so pages have one import site.
export {
  findEncoder,
  defaultContent,
  isComplete,
  incompleteFields,
  isValidWebsiteUrl,
  encodeContent,
  deriveContentName,
  googleCalendarUrl,
  formatEventWhen,
  eventStatus,
} from './qrEncoders'
