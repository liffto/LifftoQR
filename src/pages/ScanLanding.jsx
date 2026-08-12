import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Calendar,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageSquare,
  Phone,
  QrCode,
  Wifi,
} from 'lucide-react'
import { getPublicQr, vcardFileUrl } from '../api/qrcode/publicQr'
import { copyToClipboard } from '../lib/store'
import { useAuth } from '../context/AuthContext'
import { useLoginModal } from '../context/LoginModalContext'

/* The page a person lands on after scanning a dynamic QR whose content has no
   destination to redirect to — a contact card, Wi-Fi credentials, an event.
   Public: opened by whoever scanned the code, never by a logged-in owner. */

const initials = (name) =>
  (name || '')
    .split(/[\s._-]/)
    .filter(Boolean)
    .map((w) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || '?'

function Shell({ children }) {
  return (
    <div className="min-h-screen bg-canvas px-4 py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[420px]">{children}</div>
      <p className="mt-6 text-center text-[11px] text-ink-faint">
        Powered by Liffto
      </p>
    </div>
  )
}

function Card({ children, className = '' }) {
  return (
    <div
      className={`overflow-hidden rounded-[16px] bg-white shadow-card ${className}`}
    >
      {children}
    </div>
  )
}

function Row({ icon: Icon, label, value, href, wrap }) {
  if (!value) return null
  const body = (
    <>
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
        <Icon size={16} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          {label}
        </p>
        <p
          className={`text-[14px] font-medium text-ink ${wrap ? 'leading-snug' : 'truncate'}`}
        >
          {value}
        </p>
      </div>
    </>
  )
  return href ? (
    <a
      href={href}
      className="flex items-start gap-3 border-b border-line py-3 last:border-0 active:bg-canvas"
    >
      {body}
    </a>
  ) : (
    <div className="flex items-start gap-3 border-b border-line py-3 last:border-0">
      {body}
    </div>
  )
}

function CopyRow({ label, value }) {
  const [copied, setCopied] = useState(false)
  if (!value) return null
  return (
    <button
      type="button"
      onClick={() => {
        copyToClipboard(value)
        setCopied(true)
        setTimeout(() => setCopied(false), 1600)
      }}
      className="flex w-full items-center justify-between gap-3 rounded-[10px] bg-canvas px-3.5 py-3 text-left active:bg-line/40"
    >
      <div className="min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-faint">
          {label}
        </p>
        <p className="truncate text-[15px] font-bold text-ink">{value}</p>
      </div>
      {copied ? (
        <Check size={16} className="shrink-0 text-success" />
      ) : (
        <Copy size={16} className="shrink-0 text-primary" />
      )}
    </button>
  )
}

const PRIMARY_ACTION_CLS =
  'flex h-12 w-full items-center justify-center gap-2 rounded-[12px] bg-primary text-[15px] font-bold text-white shadow-sm shadow-primary/25 active:bg-primary-600 disabled:opacity-70'

function PrimaryAction({ href, download, icon: Icon, children }) {
  return (
    <a href={href} download={download} className={PRIMARY_ACTION_CLS}>
      <Icon size={18} /> {children}
    </a>
  )
}

const isAndroid =
  typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent)

/**
 * Saving a contact needs a different route per platform.
 *
 * iOS Safari follows a text/vcard response straight into the Add Contact
 * sheet, so there a plain link is the best thing available.
 *
 * Android Chrome does not: Content-Disposition: attachment means the file
 * lands in Downloads and the person has to go find it. Handing the same file
 * to the share sheet puts Contacts in front of them instead. If sharing is
 * unavailable or dismissed, the download link still works.
 */
function SaveContactButton({ slug, name }) {
  const [busy, setBusy] = useState(false)
  const url = vcardFileUrl(slug)

  const download = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${name || 'contact'}.vcf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  if (!isAndroid) {
    return (
      <PrimaryAction href={url} download icon={Download}>
        Save Contact
      </PrimaryAction>
    )
  }

  const share = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`vCard request failed: ${res.status}`)
      const blob = await res.blob()
      // text/x-vcard is the type Android's contact importer has always
      // registered for; text/vcard alone is matched less reliably.
      const file = new File([blob], `${name || 'contact'}.vcf`, {
        type: 'text/x-vcard',
      })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: name || 'Contact' })
        return
      }
      download()
    } catch (err) {
      // Dismissing the share sheet is not a failure — don't fall back to a
      // download the person just declined.
      if (err?.name !== 'AbortError') download()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      disabled={busy}
      className={PRIMARY_ACTION_CLS}
    >
      <Download size={18} /> {busy ? 'Preparing…' : 'Save Contact'}
    </button>
  )
}

// Whoever scanned this card is a stranger to us, not the owner — so the CTA
// routes through login when needed and lands them on the create flow after,
// rather than dumping them on a sign-in wall with no way back.
function CreateYourOwnButton() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openLogin } = useLoginModal()
  const go = () => {
    if (isAuthenticated) {
      navigate('/create')
      return
    }
    openLogin('/create')
  }
  return (
    <button
      type="button"
      onClick={go}
      className="flex h-12 w-full items-center justify-center gap-2 rounded-[12px] border border-line bg-white text-[15px] font-bold text-ink-soft active:bg-canvas"
    >
      <QrCode size={17} className="text-primary" /> Create your own card
    </button>
  )
}

function ContactCard({ c, slug }) {
  const name = [c.firstName, c.lastName].filter(Boolean).join(' ') || 'Contact'
  const address = [c.street, c.city, c.state, c.zip, c.country]
    .filter(Boolean)
    .join(', ')
  return (
    <>
      <Card>
        <div className="relative bg-gradient-to-br from-primary via-[#2563eb] to-[#7c3aed] px-5 pb-7 pt-6 text-center text-white">
          <div className="relative mx-auto h-24 w-24">
            {c.photo ? (
              <img
                src={c.photo}
                alt=""
                className="h-24 w-24 rounded-full object-cover ring-4 ring-white/30"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-3xl font-bold ring-4 ring-white/30">
                {initials(name)}
              </div>
            )}
            {c.logo && (
              <img
                src={c.logo}
                alt=""
                className="absolute -bottom-1 -right-1 h-9 w-9 rounded-[10px] border-2 border-white bg-white object-cover"
              />
            )}
          </div>
          <h1 className="mt-4 text-xl font-bold leading-tight">{name}</h1>
          {(c.title || c.org) && (
            <p className="mt-1 text-[13px] text-white/90">
              {[c.title, c.org].filter(Boolean).join(' · ')}
            </p>
          )}
        </div>

        <div className="px-5 py-1">
          <Row
            icon={Phone}
            label="Mobile"
            value={c.phone}
            href={c.phone ? `tel:${c.phone}` : undefined}
          />
          <Row
            icon={Building2}
            label="Work"
            value={c.workPhone}
            href={c.workPhone ? `tel:${c.workPhone}` : undefined}
          />
          <Row
            icon={Mail}
            label="Email"
            value={c.email}
            href={c.email ? `mailto:${c.email}` : undefined}
          />
          <Row
            icon={Globe}
            label="Website"
            value={c.url}
            href={
              c.url
                ? /^https?:\/\//i.test(c.url)
                  ? c.url
                  : `https://${c.url}`
                : undefined
            }
          />
          <Row icon={MapPin} label="Address" value={address} wrap />
        </div>

        {c.note && (
          <p className="mx-5 mb-5 rounded-[10px] bg-canvas p-3.5 text-[13px] leading-relaxed text-ink-soft">
            {c.note}
          </p>
        )}
      </Card>

      <div className="mt-4 space-y-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <SaveContactButton slug={slug} name={name} />
        <p className="text-center text-[11px] text-ink-faint">
          Adds {name} to your phone's contacts
        </p>
        <CreateYourOwnButton />
      </div>
    </>
  )
}

function WifiCard({ c }) {
  return (
    <Card className="p-5">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-[20px] bg-primary/10 text-primary">
          <Wifi size={30} />
        </div>
        <h1 className="mt-4 text-lg font-bold text-ink">Join this Wi-Fi</h1>
      </div>
      <div className="mt-5 space-y-2.5">
        <CopyRow label="Network" value={c.ssid} />
        {c.auth !== 'nopass' && <CopyRow label="Password" value={c.password} />}
      </div>
      <p className="mt-4 text-center text-[12px] leading-relaxed text-ink-muted">
        Tap a field to copy it, then join the network from your Wi-Fi settings.
      </p>
    </Card>
  )
}

function EventCard({ c }) {
  const when = String(c.start || '').replace('T', ' · ')
  return (
    <Card className="p-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-amber-50 text-amber-600">
        <Calendar size={26} />
      </div>
      <h1 className="mt-4 text-lg font-bold leading-tight text-ink">
        {c.title || 'Event'}
      </h1>
      <div className="mt-2">
        <Row icon={Clock} label="When" value={when} />
        <Row icon={MapPin} label="Where" value={c.location} wrap />
      </div>
      {c.description && (
        <p className="mt-3 rounded-[10px] bg-canvas p-3.5 text-[13px] leading-relaxed text-ink-soft">
          {c.description}
        </p>
      )}
    </Card>
  )
}

function TextCard({ c }) {
  return (
    <Card className="p-5">
      <h1 className="text-lg font-bold text-ink">Note</h1>
      <p className="mt-3 whitespace-pre-wrap rounded-[10px] bg-canvas p-3.5 text-[14px] leading-relaxed text-ink">
        {c.text}
      </p>
      <div className="mt-4">
        <CopyRow label="Tap to copy" value={c.text} />
      </div>
    </Card>
  )
}

function SimpleActionCard({ icon: Icon, title, rows, action }) {
  return (
    <Card className="p-5">
      <div className="flex h-14 w-14 items-center justify-center rounded-[16px] bg-primary/10 text-primary">
        <Icon size={26} />
      </div>
      <h1 className="mt-4 text-lg font-bold text-ink">{title}</h1>
      <div className="mt-2">
        {rows.map((r, i) => (
          <Row key={i} {...r} />
        ))}
      </div>
      {action && (
        <div className="mt-5">
          <PrimaryAction href={action.href} icon={action.icon}>
            {action.label}
          </PrimaryAction>
        </div>
      )}
    </Card>
  )
}

function StateCard({ icon: Icon, title, detail, spin }) {
  return (
    <Card className="px-6 py-14 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[18px] bg-canvas text-ink-muted">
        <Icon size={26} className={spin ? 'animate-spin' : undefined} />
      </div>
      <p className="mt-4 text-[15px] font-semibold text-ink">{title}</p>
      {detail && <p className="mt-1 text-[13px] text-ink-muted">{detail}</p>}
    </Card>
  )
}

function bodyFor(qr, slug) {
  const c = qr.content || {}
  switch (qr.typeKey) {
    case 'vcard':
      return <ContactCard c={c} slug={slug} />
    case 'wifi':
      return <WifiCard c={c} />
    case 'event':
      return <EventCard c={c} />
    case 'text':
      return <TextCard c={c} />
    case 'location':
      return (
        <SimpleActionCard
          icon={MapPin}
          title={c.label || 'Location'}
          rows={[
            {
              icon: MapPin,
              label: 'Coordinates',
              value: [c.lat, c.lng].filter(Boolean).join(', '),
            },
          ]}
          action={
            c.lat && c.lng
              ? {
                  href: `https://maps.google.com/?q=${c.lat},${c.lng}`,
                  icon: ExternalLink,
                  label: 'Open in Maps',
                }
              : null
          }
        />
      )
    case 'email':
      return (
        <SimpleActionCard
          icon={Mail}
          title="Send an email"
          rows={[
            { icon: Mail, label: 'To', value: c.to },
            { icon: MessageSquare, label: 'Subject', value: c.subject },
          ]}
          action={
            c.to
              ? { href: `mailto:${c.to}`, icon: Mail, label: 'Compose email' }
              : null
          }
        />
      )
    case 'sms':
      return (
        <SimpleActionCard
          icon={MessageSquare}
          title="Send a message"
          rows={[{ icon: Phone, label: 'To', value: c.number }]}
          action={
            c.number
              ? {
                  href: `sms:${c.number}`,
                  icon: MessageSquare,
                  label: 'Open Messages',
                }
              : null
          }
        />
      )
    case 'phone':
      return (
        <SimpleActionCard
          icon={Phone}
          title="Call this number"
          rows={[{ icon: Phone, label: 'Number', value: c.phone }]}
          action={
            c.phone
              ? { href: `tel:${c.phone}`, icon: Phone, label: 'Call now' }
              : null
          }
        />
      )
    default:
      return (
        <StateCard
          icon={QrCode}
          title={qr.name || 'Scanned code'}
          detail="This QR code has no content to display."
        />
      )
  }
}

export default function ScanLanding() {
  const { slug } = useParams()
  const {
    data: qr,
    isLoading,
    isError,
    error,
  } = useQuery({
    queryKey: ['public-qr', slug],
    queryFn: () => getPublicQr(slug),
    enabled: Boolean(slug),
    retry: false,
  })

  if (isLoading) {
    return (
      <Shell>
        <StateCard icon={Loader2} title="Loading…" spin />
      </Shell>
    )
  }

  if (isError || !qr) {
    const gone = error?.response?.status === 410
    return (
      <Shell>
        <StateCard
          icon={QrCode}
          title={gone ? 'This QR code is inactive' : 'QR code not found'}
          detail={
            gone
              ? 'Its owner has turned it off.'
              : 'The code may have been deleted or the link mistyped.'
          }
        />
      </Shell>
    )
  }

  return <Shell>{bodyFor(qr, slug)}</Shell>
}
