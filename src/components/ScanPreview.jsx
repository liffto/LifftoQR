import {
  Wifi,
  Mail,
  MessageSquare,
  Phone,
  Calendar,
  MapPin,
  FileText,
  Video,
  Music,
  Star,
  Share2,
  Ticket,
  Download,
  Copy,
  ExternalLink,
  Globe,
  Lock,
  Clock,
  PartyPopper,
  Smartphone,
  ChevronRight,
  Check,
  Link2,
} from 'lucide-react'
import { FaWhatsapp, FaApple, FaGooglePlay } from 'react-icons/fa'
import {
  FaInstagram,
  FaXTwitter,
  FaFacebook,
  FaTiktok,
  FaLinkedin,
  FaYoutube,
  FaSnapchat,
  FaPinterest,
  FaThreads,
  FaGithub,
  FaTelegram,
} from 'react-icons/fa6'
import { findType } from '../lib/qrTypes'
import { shortUrl } from '../lib/store'
import QRView from './QRView'

// Brand identity per social platform (for the scan preview).
const SOCIAL = {
  instagram: { Icon: FaInstagram, color: '#E4405F', label: 'Instagram' },
  x: { Icon: FaXTwitter, color: '#000000', label: 'X' },
  facebook: { Icon: FaFacebook, color: '#1877F2', label: 'Facebook' },
  tiktok: { Icon: FaTiktok, color: '#000000', label: 'TikTok' },
  linkedin: { Icon: FaLinkedin, color: '#0A66C2', label: 'LinkedIn' },
  youtube: { Icon: FaYoutube, color: '#FF0000', label: 'YouTube' },
  snapchat: { Icon: FaSnapchat, color: '#FFC800', label: 'Snapchat' },
  pinterest: { Icon: FaPinterest, color: '#BD081C', label: 'Pinterest' },
  threads: { Icon: FaThreads, color: '#000000', label: 'Threads' },
  github: { Icon: FaGithub, color: '#181717', label: 'GitHub' },
  whatsapp: { Icon: FaWhatsapp, color: '#25D366', label: 'WhatsApp' },
  telegram: { Icon: FaTelegram, color: '#26A5E4', label: 'Telegram' },
}

// Types where showing the actual QR is clearer than a landing-page mockup
// (simple redirect, plain text, or a native OS action — no branded page).
const QR_PREVIEW_TYPES = new Set(['url', 'text', 'wifi', 'phone', 'location'])
export const previewsAsQR = (typeKey) => QR_PREVIEW_TYPES.has(typeKey)

/* Mockup of what a person sees after scanning. Dynamic QRs route through our
   site (branded landing page); this previews that page so the creator knows
   exactly what their audience will experience. */

const host = (u) => {
  const s = String(u || '').trim()
  if (!s) return ''
  try {
    return new URL(
      /^https?:\/\//i.test(s) ? s : 'https://' + s,
    ).hostname.replace(/^www\./, '')
  } catch {
    return s.replace(/^https?:\/\//i, '').split('/')[0]
  }
}

function PhoneFrame({ children }) {
  return (
    <div className="mx-auto w-[300px] max-w-full">
      <div className="rounded-[42px] bg-[#0e1628] p-2.5 shadow-2xl shadow-black/20">
        <div
          className="relative overflow-hidden rounded-[32px] bg-canvas"
          style={{ height: 566 }}
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex h-7 items-start justify-center">
            <div className="mt-0 h-5 w-24 rounded-b-2xl bg-[#0e1628]" />
          </div>
          <div className="h-full overflow-y-auto no-scrollbar">{children}</div>
        </div>
      </div>
    </div>
  )
}

function AddressBar({ slug }) {
  return (
    <div className="bg-white px-3 pb-2 pt-9">
      <div className="flex items-center gap-1.5 rounded-full bg-canvas px-3 py-1.5 text-[11px] text-ink-muted">
        <Lock size={10} className="shrink-0" />
        <span className="truncate">{shortUrl(slug || 'xxxx')}</span>
      </div>
    </div>
  )
}

function Btn({ icon: Icon, children, color = 'primary' }) {
  const cls =
    color === 'primary'
      ? 'bg-primary text-white'
      : color === 'green'
        ? 'bg-[#25D366] text-white'
        : color === 'dark'
          ? 'bg-ink text-white'
          : 'bg-white text-ink border border-line'
  return (
    <div
      className={`flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold ${cls}`}
    >
      {Icon && <Icon size={16} />} {children}
    </div>
  )
}

function Row({ icon: Icon, label, value, wrap }) {
  if (!value) return null
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
        <Icon size={14} />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          {label}
        </p>
        <p
          className={`text-[13px] font-medium text-ink ${wrap ? 'leading-snug' : 'truncate'}`}
        >
          {value}
        </p>
      </div>
    </div>
  )
}

const initials = (name) =>
  (name || '')
    .split(/[\s._-]/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

/* ── per-type landing pages ─────────────────────────────────────────── */

function RedirectPage({
  dest,
  action = 'Continue to site',
  icon: Icon = Globe,
  title,
}) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/10 text-primary">
        <Icon size={28} />
      </div>
      <p className="mt-5 text-sm font-semibold text-ink">
        {title || 'Redirecting you…'}
      </p>
      <p className="mt-1 break-all text-xs text-ink-muted">
        {dest || 'your destination'}
      </p>
      <div className="mt-6 w-full">
        <Btn icon={ExternalLink}>{action}</Btn>
      </div>
      <p className="mt-4 text-[10px] text-ink-faint">Powered by Liffto</p>
    </div>
  )
}

function ContactPage({ c }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Contact'
  return (
    <div className="flex min-h-full flex-col">
      <div className="bg-gradient-to-br from-primary to-[#7c3aed] px-5 pb-8 pt-4 text-center text-white">
        <div className="relative mx-auto h-20 w-20">
          {c.photo ? (
            <img
              src={c.photo}
              alt=""
              className="h-20 w-20 rounded-full object-cover ring-4 ring-white/30"
            />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/20 text-2xl font-bold ring-4 ring-white/30">
              {initials(name)}
            </div>
          )}
          {c.logo && (
            <img
              src={c.logo}
              alt=""
              className="absolute -bottom-1 -right-1 h-8 w-8 rounded-[9px] border-2 border-white bg-white object-cover"
            />
          )}
        </div>
        <p className="mt-3 text-lg font-bold leading-tight">{name}</p>
        {(c.title || c.org) && (
          <p className="text-xs text-white/85">
            {[c.title, c.org].filter(Boolean).join(' · ')}
          </p>
        )}
      </div>
      <div className="flex-1 px-5 py-3">
        <Row icon={Phone} label="Mobile" value={c.phone} />
        <Row icon={Phone} label="Work" value={c.workPhone} />
        <Row icon={Mail} label="Email" value={c.email} />
        <Row icon={Globe} label="Website" value={c.url} />
        <Row
          icon={MapPin}
          label="Address"
          wrap
          value={[c.street, c.city, c.state, c.zip, c.country]
            .filter(Boolean)
            .join(', ')}
        />
        {c.note && (
          <p className="mt-2 rounded-[10px] bg-canvas p-3 text-xs leading-relaxed text-ink-soft">
            {c.note}
          </p>
        )}
      </div>
      <div className="sticky bottom-0 border-t border-line bg-white p-4">
        <Btn icon={Download}>Save Contact</Btn>
      </div>
    </div>
  )
}

function WifiPage({ c }) {
  return (
    <div className="flex h-full flex-col px-5 pb-5">
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/10 text-primary">
          <Wifi size={28} />
        </div>
        <p className="mt-4 text-sm font-bold text-ink">
          Join this Wi-Fi network
        </p>
        <div className="mt-4 w-full space-y-2 text-left">
          <div className="rounded-[10px] bg-white p-3 shadow-sm">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
              Network
            </p>
            <p className="text-sm font-bold text-ink">
              {c.ssid || 'My Network'}
            </p>
          </div>
          {c.auth !== 'nopass' && (
            <div className="flex items-center justify-between rounded-[10px] bg-white p-3 shadow-sm">
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
                  Password
                </p>
                <p className="truncate text-sm font-bold text-ink">
                  {c.password || '••••••••'}
                </p>
              </div>
              <Copy size={15} className="shrink-0 text-primary" />
            </div>
          )}
        </div>
      </div>
      <Btn icon={Wifi}>Connect</Btn>
    </div>
  )
}

function EventPage({ c }) {
  const when = (c.start || '').replace('T', ' · ')
  return (
    <div className="flex h-full flex-col px-5 pb-5 pt-2">
      <div className="flex-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-amber-50 text-amber-600">
          <Calendar size={26} />
        </div>
        <p className="mt-4 text-lg font-bold leading-tight text-ink">
          {c.title || 'Event'}
        </p>
        <div className="mt-3 space-y-1">
          <Row icon={Clock} label="When" value={when || 'Date & time'} />
          <Row icon={MapPin} label="Where" value={c.location} />
        </div>
        {c.description && (
          <p className="mt-2 rounded-[10px] bg-canvas p-3 text-xs leading-relaxed text-ink-soft">
            {c.description}
          </p>
        )}
      </div>
      <Btn icon={Calendar}>Add to Calendar</Btn>
    </div>
  )
}

function LocationPage({ c }) {
  return (
    <div className="flex h-full flex-col">
      <div className="relative flex-1 bg-gradient-to-br from-emerald-100 via-sky-100 to-emerald-50">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              'linear-gradient(#0002 1px,transparent 1px),linear-gradient(90deg,#0002 1px,transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <MapPin
            size={40}
            className="text-red-500 drop-shadow"
            fill="currentColor"
          />
        </div>
      </div>
      <div className="border-t border-line bg-white p-4">
        <p className="text-sm font-bold text-ink">{c.label || 'Dropped pin'}</p>
        <p className="mb-3 text-xs text-ink-muted">
          {[c.lat, c.lng].filter(Boolean).join(', ') || 'Coordinates'}
        </p>
        <Btn icon={MapPin}>Open in Maps</Btn>
      </div>
    </div>
  )
}

function LinkTreePage({ c }) {
  const links = (Array.isArray(c.links) ? c.links : []).filter(
    (l) => l && (l.url || l.label),
  )
  return (
    <div className="min-h-full px-5 pb-6 pt-3 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[#7c3aed] text-xl font-bold text-white">
        {initials(c.title || 'Links')}
      </div>
      <p className="mt-3 text-sm font-bold text-ink">{c.title || 'My Links'}</p>
      <div className="mt-5 space-y-2.5">
        {(links.length ? links : [{ label: 'Your first link' }]).map((l, i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-[12px] bg-white px-4 py-3 text-sm font-semibold text-ink shadow-sm"
          >
            <span className="truncate">{l.label || host(l.url) || 'Link'}</span>
            <ChevronRight size={15} className="shrink-0 text-ink-faint" />
          </div>
        ))}
      </div>
    </div>
  )
}

function CouponPage({ c }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 pb-5 text-center">
      <div className="w-full rounded-[16px] border-2 border-dashed border-primary/40 bg-white p-5">
        <Ticket size={26} className="mx-auto text-primary" />
        <p className="mt-2 text-sm font-bold text-ink">
          {c.title || 'Special offer'}
        </p>
        {c.code && (
          <p className="mt-3 rounded-[10px] bg-primary/10 px-4 py-2 text-lg font-black tracking-widest text-primary">
            {c.code}
          </p>
        )}
        {c.expiry && (
          <p className="mt-2 text-[11px] text-ink-muted">Expires {c.expiry}</p>
        )}
        {c.description && (
          <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
            {c.description}
          </p>
        )}
      </div>
      <div className="mt-4 w-full">
        <Btn icon={Copy}>Copy code</Btn>
      </div>
    </div>
  )
}

function AppPage({ c }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-5 pb-5 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/10 text-primary">
        <Smartphone size={28} />
      </div>
      <p className="mt-4 text-sm font-bold text-ink">
        {c.name || 'Get the app'}
      </p>
      <p className="mt-1 text-[11px] text-ink-muted">
        We'll open the right store for your device
      </p>
      <div className="mt-5 w-full space-y-2.5">
        {c.iosUrl && (
          <Btn icon={FaApple} color="dark">
            App Store
          </Btn>
        )}
        {c.androidUrl && (
          <Btn icon={FaGooglePlay} color="green">
            Google Play
          </Btn>
        )}
      </div>
    </div>
  )
}

function ReviewPage({ c }) {
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pb-5 text-center">
      <p className="text-sm font-bold text-ink">
        {c.businessName || 'How was your visit?'}
      </p>
      <p className="mt-1 text-[11px] text-ink-muted">
        Tap a star to rate us on Google
      </p>
      <div className="mt-4 flex gap-1">
        {[0, 1, 2, 3, 4].map((i) => (
          <Star
            key={i}
            size={26}
            className="text-amber-400"
            fill="currentColor"
          />
        ))}
      </div>
      <div className="mt-6 w-full">
        <Btn icon={ExternalLink}>Write a review</Btn>
      </div>
    </div>
  )
}

function SimplePage({
  icon,
  title,
  rows = [],
  action,
  actionIcon,
  color,
  footer,
}) {
  return (
    <div className="flex h-full flex-col px-5 pb-5 pt-2">
      <div className="flex-1">
        <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
          {icon}
        </div>
        <p className="mt-4 text-sm font-bold text-ink">{title}</p>
        <div className="mt-3">
          {rows.map((r, i) => (
            <Row key={i} {...r} />
          ))}
        </div>
        {footer}
      </div>
      <Btn icon={actionIcon} color={color}>
        {action}
      </Btn>
    </div>
  )
}

function SocialPage({ c }) {
  const p = SOCIAL[String(c.platform || '').toLowerCase()] || {
    Icon: Share2,
    color: '#1B59F5',
    label: 'Profile',
  }
  const Icon = p.Icon
  const handle = String(c.handle || '').replace(/^@+/, '')
  const btnBg = p.color === '#FFC800' ? '#0e1628' : p.color
  return (
    <div className="flex h-full flex-col items-center justify-center px-6 pb-6 text-center">
      <div
        className="flex h-20 w-20 items-center justify-center rounded-[24px]"
        style={{ backgroundColor: p.color + '1A', color: p.color }}
      >
        <Icon size={40} />
      </div>
      <p className="mt-4 text-base font-bold text-ink">{p.label}</p>
      {handle && <p className="mt-0.5 text-[13px] text-ink-muted">@{handle}</p>}
      <div className="mt-6 w-full">
        <div
          className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] text-sm font-bold text-white"
          style={{ backgroundColor: btnBg }}
        >
          <Icon size={16} /> Open {p.label}
        </div>
      </div>
    </div>
  )
}

function bodyFor(record) {
  const c = record.content || {}
  switch (record.typeKey) {
    case 'vcard':
      return <ContactPage c={c} />
    case 'wifi':
      return <WifiPage c={c} />
    case 'event':
      return <EventPage c={c} />
    case 'location':
      return <LocationPage c={c} />
    case 'linktree':
      return <LinkTreePage c={c} />
    case 'coupon':
      return <CouponPage c={c} />
    case 'app':
      return <AppPage c={c} />
    case 'google-review':
      return <ReviewPage c={c} />
    case 'text':
      return (
        <SimplePage
          icon={<FileText size={26} />}
          title="Note"
          action="Copy text"
          actionIcon={Copy}
          footer={
            <p className="mt-1 whitespace-pre-wrap rounded-[10px] bg-canvas p-3 text-[13px] leading-relaxed text-ink">
              {c.text || 'Your text will appear here.'}
            </p>
          }
        />
      )
    case 'email':
      return (
        <SimplePage
          icon={<Mail size={26} />}
          title="Send an email"
          action="Compose Email"
          actionIcon={Mail}
          rows={[
            { icon: Mail, label: 'To', value: c.to },
            { icon: MessageSquare, label: 'Subject', value: c.subject },
          ]}
          footer={
            c.body && (
              <p className="mt-1 rounded-[10px] bg-canvas p-3 text-xs leading-relaxed text-ink-soft">
                {c.body}
              </p>
            )
          }
        />
      )
    case 'sms':
      return (
        <SimplePage
          icon={<MessageSquare size={26} />}
          title="Send a text message"
          action="Open Messages"
          actionIcon={MessageSquare}
          rows={[{ icon: Phone, label: 'To', value: c.number }]}
          footer={
            c.message && (
              <p className="mt-1 rounded-[10px] bg-canvas p-3 text-xs leading-relaxed text-ink-soft">
                {c.message}
              </p>
            )
          }
        />
      )
    case 'phone':
      return (
        <SimplePage
          icon={<Phone size={26} />}
          title="Call this number"
          action="Call now"
          actionIcon={Phone}
          color="green"
          rows={[{ icon: Phone, label: 'Number', value: c.phone }]}
        />
      )
    case 'whatsapp':
      return (
        <SimplePage
          icon={<FaWhatsapp size={26} />}
          title="Chat on WhatsApp"
          action="Open WhatsApp"
          actionIcon={FaWhatsapp}
          color="green"
          rows={[
            {
              icon: Phone,
              label: 'Number',
              value:
                '+' +
                ((c.countryCode || '') + (c.phone || '')).replace(
                  /[^0-9]/g,
                  '',
                ),
            },
          ]}
          footer={
            c.message && (
              <p className="mt-1 rounded-[10px] bg-canvas p-3 text-xs leading-relaxed text-ink-soft">
                {c.message}
              </p>
            )
          }
        />
      )
    case 'pdf':
      return (
        <RedirectPage
          icon={FileText}
          title="Open document"
          dest={host(c.url) || 'your PDF'}
          action="Open PDF"
        />
      )
    case 'video':
      return (
        <RedirectPage
          icon={Video}
          title="Watch video"
          dest={host(c.url) || 'your video'}
          action="Play video"
        />
      )
    case 'mp3':
      return (
        <RedirectPage
          icon={Music}
          title={c.title || 'Play audio'}
          dest={host(c.url) || 'your track'}
          action="Play"
        />
      )
    case 'social':
      return <SocialPage c={c} />
    case 'invitation':
      return (
        <RedirectPage
          icon={PartyPopper}
          title={c.title || 'You are invited'}
          dest={host(c.url) || 'your invitation'}
          action="View invitation"
        />
      )
    case 'feedback':
      return (
        <RedirectPage
          icon={MessageSquare}
          title="We'd love your feedback"
          dest={host(c.url) || 'your form'}
          action="Open form"
        />
      )
    default:
      return (
        <RedirectPage
          icon={Globe}
          title="Taking you to…"
          dest={host(c.url) || host(record.url) || 'your website'}
        />
      )
  }
}

function QrCard({ record }) {
  const dyn = !!record?.dynamic
  return (
    <div className="mx-auto flex w-[300px] max-w-full flex-col items-center rounded-[10px] border border-line bg-white p-6 shadow-sm">
      <div className="rounded-[10px] border border-line bg-white p-4 shadow-sm">
        <QRView record={record} size={200} />
      </div>
      <p className="mt-4 max-w-full truncate text-sm font-semibold text-ink">
        {record?.name || 'Your QR code'}
      </p>
      <span
        className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          dyn ? 'bg-primary/10 text-primary' : 'bg-emerald-50 text-emerald-600'
        }`}
      >
        <span
          className={`h-1.5 w-1.5 rounded-full ${dyn ? 'bg-primary' : 'bg-emerald-500'}`}
        />
        {dyn ? 'Dynamic QR' : 'Static QR'}
      </span>
    </div>
  )
}

export default function ScanPreview({ record }) {
  if (previewsAsQR(record?.typeKey)) return <QrCard record={record} />
  const dyn = !!record?.dynamic
  return (
    <PhoneFrame>
      <div className="flex min-h-full flex-col bg-canvas">
        {dyn ? (
          <AddressBar slug={record.slug} />
        ) : (
          <div className="h-9 shrink-0" />
        )}
        <div className="flex-1">{bodyFor(record)}</div>
      </div>
    </PhoneFrame>
  )
}
