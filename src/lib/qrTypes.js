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

// Re-export the pure helpers so pages have one import site.
export {
  findEncoder,
  defaultContent,
  isComplete,
  encodeContent,
  deriveContentName,
} from './qrEncoders'
