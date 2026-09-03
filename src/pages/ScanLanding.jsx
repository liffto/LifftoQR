import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  Building2,
  Calendar,
  CalendarPlus,
  CalendarX,
  Check,
  Clock,
  Copy,
  Download,
  ExternalLink,
  FileText,
  Globe,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Pencil,
  Phone,
  QrCode,
  ShieldCheck,
  Wifi,
} from 'lucide-react'
import { getPublicQr, vcardFileUrl } from '../api/qrcode/publicQr'
import { copyToClipboard, defaultDesign } from '../lib/store'
import {
  googleCalendarUrl,
  formatEventWhen,
  eventStatus,
  encodeContent,
} from '../lib/qrTypes'
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
    // Centred rather than pinned to the top, because most of the time this is a
    // phone and the card fills the screen, but opened on a laptop it was a thin
    // strip stranded under a lot of empty grey. min-h-screen rather than a
    // fixed height, so a long card (a contact with every field filled) grows
    // the page and scrolls normally instead of being centred out of reach.
    <div className="flex min-h-screen flex-col justify-center bg-canvas px-4 py-6 sm:py-10">
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
 * Save Contact, which has to work differently per platform.
 *
 * No web API writes to the address book, and Android will not let a page open
 * the contacts screen either — that activity does not declare BROWSABLE, so an
 * insert intent is refused. Both platforms therefore end at a confirm step.
 *
 * iOS: Safari renders a text/vcard response as its own Add Contact sheet, so a
 * plain link is already the native path.
 *
 * Android: the same link lands the file in Downloads and leaves the person to
 * find it. Handing it to the share sheet instead keeps them on the page and
 * puts Contacts in the list — assuming the device offers it, which varies. If
 * sharing is unavailable the download still happens, so this can only match or
 * beat the old behaviour.
 */
function SaveContactButton({ slug, name }) {
  const [busy, setBusy] = useState(false)
  const url = vcardFileUrl(slug)

  if (!isAndroid) {
    return (
      <PrimaryAction href={url} download icon={Download}>
        Save Contact
      </PrimaryAction>
    )
  }

  const downloadInstead = () => {
    const a = document.createElement('a')
    a.href = url
    a.download = `${name || 'contact'}.vcf`
    document.body.appendChild(a)
    a.click()
    a.remove()
  }

  const save = async () => {
    if (busy) return
    setBusy(true)
    try {
      const res = await fetch(url)
      if (!res.ok) throw new Error(`vCard request failed: ${res.status}`)
      // text/x-vcard is the type Android's contact importer has long
      // registered for; text/vcard alone is matched less consistently.
      const file = new File([await res.blob()], `${name || 'contact'}.vcf`, {
        type: 'text/x-vcard',
      })
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: name || 'Contact' })
        return
      }
      downloadInstead()
    } catch (err) {
      // Dismissing the sheet is a decision, not a failure — starting a
      // download they just backed out of would be the wrong response.
      if (err?.name !== 'AbortError') downloadInstead()
    } finally {
      setBusy(false)
    }
  }

  return (
    <button
      type="button"
      onClick={save}
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
function CreateYourOwnButton({ label = 'Create your own card' }) {
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
      <QrCode size={17} className="text-primary" /> {label}
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
  const when = formatEventWhen(c)
  // Null when there is no usable start date — no point offering a link that
  // opens an empty calendar form.
  const calendarUrl = googleCalendarUrl(c)
  // A printed QR outlives the event it was printed for. Without this the page
  // read as an invitation forever, and went on offering to put last month's
  // thing in your calendar.
  const status = eventStatus(c)
  const ended = status === 'ended'

  return (
    <>
      <Card className="p-5">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-[16px] ${
            ended ? 'bg-canvas text-ink-faint' : 'bg-amber-50 text-amber-600'
          }`}
        >
          <Calendar size={26} />
        </div>

        {/* Said before the title, because it changes what the rest of the card
            means. Nothing is shown for an event still to come — the date says
            that already, and a badge reading "Upcoming" on every future event
            is noise. */}
        {(ended || status === 'now') && (
          <span
            className={`mt-4 inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.08em] ${
              ended
                ? 'bg-canvas text-ink-muted'
                : 'bg-success/10 text-success'
            }`}
          >
            {ended ? (
              <>
                <CalendarX size={13} /> Event ended
              </>
            ) : (
              <>
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Happening now
              </>
            )}
          </span>
        )}

        <h1
          className={`mt-3 text-lg font-bold leading-tight ${ended ? 'text-ink-muted' : 'text-ink'}`}
        >
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

      {/* The details stay — someone scanning an old poster may well want to
          know what it was — but the invitation does not. Adding a finished
          event to a calendar is not useful, and a primary button offering it is
          the page failing to notice the date. */}
      {ended ? (
        <p className="mt-4 pb-[max(0.5rem,env(safe-area-inset-bottom))] text-center text-[12px] leading-relaxed text-ink-faint">
          This event has already taken place.
        </p>
      ) : (
        calendarUrl && (
          <div className="mt-4 space-y-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <a
              href={calendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={PRIMARY_ACTION_CLS}
            >
              <CalendarPlus size={18} /> Add to Google Calendar
            </a>
            <p className="text-center text-[11px] text-ink-faint">
              Opens Google Calendar with the details filled in
            </p>
          </div>
        )
      )}
    </>
  )
}

/**
 * The landing for a dynamic code whose whole point is one action: call this
 * number, send this message, open this chat, read this note.
 *
 * Someone reaches this by pointing a camera at a sticker, standing up, on a
 * phone, with a few seconds of patience and no idea what they just scanned. So
 * the page answers three questions in that order, before anything else:
 *
 *   what is this — the headline, in plain language, saying what the code holds
 *   what will happen — the button says the app it opens, never just "Continue"
 *   is that safe — the value is shown in full first, so nobody is handed to a
 *   dialer or a mail client without seeing the number or the address
 *
 * That last one is the whole reason these types land here rather than firing
 * tel: or mailto: straight from the scan. A code that silently opens your phone
 * app is the sort of thing people learn not to scan.
 *
 * The message is editable, which is the part that surprises people. A prefilled
 * message written by whoever printed the sticker is a guess at what the scanner
 * wants to say; letting them adjust it before it reaches their app costs one
 * textarea and turns a broadcast into their own message. The recipient stays
 * fixed — that is the owner's decision, not the scanner's.
 */

// Grows with what is typed, up to the cap in the class below. Without a cap a
// long message pushes the primary button off the bottom of the phone, which is
// a poor trade for a field nobody asked to be endless — past that height it
// scrolls instead.
function useAutoGrow(value) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [value])
  return ref
}

function EditableMessage({ label, value, onChange, placeholder }) {
  const ref = useAutoGrow(value)
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3">
        <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
          {label}
        </p>
        <span className="flex items-center gap-1 text-[10px] font-medium text-ink-faint">
          <Pencil size={10} /> Edit before sending
        </span>
      </div>
      <textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={1}
        aria-label={label}
        className="max-h-[38vh] w-full resize-none overflow-y-auto rounded-[14px] rounded-bl-[4px] border border-line bg-canvas px-4 py-3 text-[14px] leading-relaxed text-ink outline-none transition focus:border-primary focus:bg-white placeholder:text-ink-faint"
      />
    </div>
  )
}

/**
 * Whether this is a machine with a mouse, which for these pages is the same
 * question as "will tel: and sms: do anything".
 *
 * Both are handed to the OS, and on a desktop without a phone app paired there
 * is nothing to hand them to — the click does nothing at all, with no error and
 * no feedback. A big primary button that silently fails is worse than not
 * offering it, so these pages ask first. mailto: and wa.me are left alone:
 * those work on a desktop.
 *
 * hover + fine pointer rather than a user-agent string, because the question is
 * about the input device rather than the brand of the machine.
 */
function useHasMouse() {
  const [hasMouse, setHasMouse] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia?.('(hover: hover) and (pointer: fine)')
    if (!mq) return undefined
    const sync = () => setHasMouse(mq.matches)
    sync()
    mq.addEventListener?.('change', sync)
    return () => mq.removeEventListener?.('change', sync)
  }, [])
  return hasMouse
}

// Only imported when a desktop actually renders it. qr-code-styling itself is
// already in the shell's preload list — the landing page needs it — so this
// saves the component rather than the library, but a phone still never parses
// code it cannot reach.
const QRViewLazy = lazy(() => import('../components/QRView'))

/**
 * The way out of a dead end: a code carrying the action itself, to be picked up
 * on a phone.
 *
 * Someone reached this page on a laptop, which means it arrived as a link
 * rather than a scan — forwarded, pasted, opened from a chat. The thing they
 * want to do is a phone thing. Handing them a code to scan is the shortest
 * route from where they are to where the action works, and because it encodes
 * the action rather than this page's address, it carries whatever they typed in
 * the message box with it.
 */
function ContinueOnPhone({ payload, caption }) {
  if (!payload) return null
  return (
    <div className="rounded-[12px] border border-line bg-white p-4">
      <div className="flex items-center gap-4">
        <div className="shrink-0 rounded-[10px] border border-line/60 bg-white p-1.5">
          <Suspense
            fallback={<div className="h-[92px] w-[92px] rounded bg-canvas" />}
          >
            <QRViewLazy
              record={{ typeKey: 'text', content: { text: payload }, design: defaultDesign() }}
              size={92}
            />
          </Suspense>
        </div>
        <div className="min-w-0">
          <p className="text-[13px] font-bold text-ink">Continue on your phone</p>
          <p className="mt-1 text-[12px] leading-relaxed text-ink-muted">
            {caption}
          </p>
        </div>
      </div>
    </div>
  )
}

function ActionScanCard({
  accent,
  icon: Icon,
  eyebrow,
  headline,
  value,
  valueLabel,
  message,
  messageLabel,
  editableMessage,
  onMessageChange,
  messagePlaceholder,
  action,
  reassurance,
  copyValue,
  copyLabel,
  desktop,
}) {
  const hasMouse = useHasMouse()
  // On a desktop the app link is dead for these types, so copying becomes the
  // action rather than an afterthought, and the code below offers the phone.
  const deskMode = hasMouse && desktop
  return (
    <>
      <Card className="animate-pop">
        <div
          className="px-5 pb-6 pt-7 text-center text-white"
          style={{ background: accent.gradient }}
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/20">
            <Icon size={28} />
          </div>
          <p className="mt-4 text-[11px] font-bold uppercase tracking-[0.14em] text-white/70">
            {eyebrow}
          </p>
          <h1 className="mt-1 text-[21px] font-bold leading-tight">{headline}</h1>
        </div>

        <div className="px-5 py-5">
          {/* The value is the point of the card, so it is set at a size you can
              read at arm's length and left selectable for anyone who would
              rather take it than tap it. */}
          {value && (
            <div className="text-center">
              {valueLabel && (
                <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                  {valueLabel}
                </p>
              )}
              <p className="mt-1 select-all break-words text-[19px] font-bold leading-snug text-ink">
                {value}
              </p>
            </div>
          )}

          {editableMessage ? (
            <div className={value ? 'mt-4' : ''}>
              <EditableMessage
                label={messageLabel}
                value={message}
                onChange={onMessageChange}
                placeholder={messagePlaceholder}
              />
            </div>
          ) : (
            message && (
              <div className={value ? 'mt-4' : ''}>
                {messageLabel && (
                  <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-faint">
                    {messageLabel}
                  </p>
                )}
                {/* A bubble because that is what it is: a draft, sitting in an
                    app, waiting to be sent. A plain grey field reads like
                    something already on its way. */}
                <div className="rounded-[14px] rounded-bl-[4px] bg-canvas px-4 py-3">
                  <p className="whitespace-pre-wrap text-[14px] leading-relaxed text-ink">
                    {message}
                  </p>
                </div>
              </div>
            )
          )}
        </div>
      </Card>

      <div className="mt-4 space-y-2.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {/* An anchor when the action is a link the phone should hand to another
            app, a button when it is something this page does itself. Copying a
            note is still the action — it should not be demoted to a footnote
            just because it has no URL. */}
        {(!deskMode || !desktop.replacesAction) &&
          action &&
          (action.onClick ? (
            <button
              type="button"
              onClick={action.onClick}
              className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[12px] text-[15px] font-bold text-white shadow-sm transition-opacity active:opacity-90"
              style={{ background: accent.solid }}
            >
              <action.icon size={19} /> {action.label}
            </button>
          ) : (
            <a
              href={action.href}
              className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[12px] text-[15px] font-bold text-white shadow-sm transition-opacity active:opacity-90"
              style={{ background: accent.solid }}
            >
              <action.icon size={19} /> {action.label}
            </a>
          ))}

        {/* Says plainly that pressing the button does not send anything. It is
            the difference between a scanner acting and a scanner backing out. */}
        {deskMode && desktop.action && (
          <button
            type="button"
            onClick={desktop.action.onClick}
            className="flex h-[52px] w-full items-center justify-center gap-2.5 rounded-[12px] text-[15px] font-bold text-white shadow-sm transition-opacity active:opacity-90"
            style={{ background: accent.solid }}
          >
            <desktop.action.icon size={19} /> {desktop.action.label}
          </button>
        )}

        {(deskMode ? desktop.reassurance : reassurance) && (
          <p className="flex items-center justify-center gap-1.5 text-center text-[11.5px] leading-relaxed text-ink-faint">
            <ShieldCheck size={13} className="shrink-0" />
            {deskMode ? desktop.reassurance : reassurance}
          </p>
        )}

        {deskMode && (
          <ContinueOnPhone
            payload={desktop.payload}
            caption={desktop.caption}
          />
        )}

        {copyValue && <CopyRow label={copyLabel} value={copyValue} />}

        {/* The scanner is a stranger who has just seen the product work. This
            is the only moment they are holding it, so it is the one place worth
            asking — the same offer the contact card has always made. */}
        <div className="pt-1">
          <CreateYourOwnButton label="Create your own QR code" />
        </div>
      </div>
    </>
  )
}

// Per-type colour, because the action is what the scanner is deciding about and
// the colour is the fastest way to say which one it is. WhatsApp gets its own
// green for the same reason its button does everywhere else.
const ACCENTS = {
  phone: {
    solid: '#0F9D58',
    gradient: 'linear-gradient(135deg, #0F9D58 0%, #0B7C46 100%)',
  },
  sms: {
    solid: '#1B59F5',
    gradient: 'linear-gradient(135deg, #1B59F5 0%, #2563eb 60%, #7c3aed 100%)',
  },
  whatsapp: {
    solid: '#25D366',
    gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
  },
  email: {
    solid: '#5B4BE1',
    gradient: 'linear-gradient(135deg, #5B4BE1 0%, #7c3aed 100%)',
  },
  text: {
    solid: '#1F2430',
    gradient: 'linear-gradient(135deg, #2A3142 0%, #1F2430 100%)',
  },
}

function TextCard({ c }) {
  const text = c.text || ''
  const [copied, setCopied] = useState(false)
  return (
    <ActionScanCard
      accent={ACCENTS.text}
      icon={FileText}
      eyebrow="Note"
      headline="Someone left you a message"
      message={text}
      messageLabel="What it says"
      action={
        text
          ? {
              icon: copied ? Check : Copy,
              label: copied ? 'Copied' : 'Copy text',
              onClick: () => {
                copyToClipboard(text)
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
              },
            }
          : null
      }
      reassurance="Nothing leaves this page — the note is yours to keep"
    />
  )
}

function PhoneCard({ c }) {
  const number = c.phone || ''
  const [copied, setCopied] = useState(false)
  const copy = () => {
    copyToClipboard(number)
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <ActionScanCard
      accent={ACCENTS.phone}
      icon={Phone}
      eyebrow="Phone"
      headline="Call this number"
      value={number}
      valueLabel="Number"
      action={
        number
          ? { href: `tel:${number}`, icon: Phone, label: 'Call now' }
          : null
      }
      reassurance="Opens your phone app — you place the call"
      copyValue={number}
      copyLabel="Tap to copy the number"
      desktop={{
        replacesAction: true,
        action: number
          ? {
              icon: copied ? Check : Copy,
              label: copied ? 'Number copied' : 'Copy number',
              onClick: copy,
            }
          : null,
        reassurance: 'A computer cannot place the call — copy it, or scan below',
        payload: number ? encodeContent('phone', { phone: number }) : '',
        caption: 'Point your camera at this and the call is ready to place.',
      }}
    />
  )
}

function SmsCard({ c }) {
  const number = c.number || ''
  const [message, setMessage] = useState(c.message || '')
  const [copied, setCopied] = useState(false)
  const copy = () => {
    copyToClipboard([number, message].filter(Boolean).join('\n'))
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <ActionScanCard
      accent={ACCENTS.sms}
      icon={MessageSquare}
      eyebrow="Text message"
      headline={c.message ? 'Send this message' : 'Message this number'}
      value={number}
      valueLabel="To"
      message={message}
      messageLabel="Message"
      editableMessage
      onMessageChange={setMessage}
      messagePlaceholder="Write your message…"
      action={
        number
          ? {
              href: `sms:${number}${message ? `?body=${encodeURIComponent(message)}` : ''}`,
              icon: MessageSquare,
              label: 'Open Messages',
            }
          : null
      }
      reassurance="Opens your messaging app with this ready — nothing is sent until you send it"
      copyValue={number}
      copyLabel="Tap to copy the number"
      desktop={{
        replacesAction: true,
        action: number
          ? {
              icon: copied ? Check : Copy,
              label: copied ? 'Copied' : 'Copy number and message',
              onClick: copy,
            }
          : null,
        reassurance:
          'A computer cannot send the text — copy it, or scan below to carry it across',
        // Encodes the message as edited, so whatever is in the box travels to
        // the phone with it.
        payload: number ? encodeContent('sms', { number, message }) : '',
        caption: 'Point your camera at this and the message is ready to send.',
      }}
    />
  )
}

function WhatsappCard({ c }) {
  const digits = String(`${c.countryCode || ''}${c.phone || ''}`).replace(
    /[^0-9]/g,
    '',
  )
  const shown = [c.countryCode, c.phone].filter(Boolean).join(' ')
  const [message, setMessage] = useState(c.message || '')
  return (
    <ActionScanCard
      accent={ACCENTS.whatsapp}
      icon={MessageCircle}
      eyebrow="WhatsApp"
      headline={c.message ? 'Send this on WhatsApp' : 'Chat on WhatsApp'}
      value={shown}
      valueLabel="To"
      message={message}
      messageLabel="Message"
      editableMessage
      onMessageChange={setMessage}
      messagePlaceholder="Write your message…"
      action={
        digits
          ? {
              href: `https://wa.me/${digits}${message ? `?text=${encodeURIComponent(message)}` : ''}`,
              icon: MessageCircle,
              label: 'Open WhatsApp',
            }
          : null
      }
      reassurance="Opens the chat with this ready — nothing is sent until you send it"
      copyValue={shown}
      copyLabel="Tap to copy the number"
    />
  )
}

function EmailCard({ c }) {
  const to = c.to || ''
  const [body, setBody] = useState(c.body || '')
  const params = []
  if (c.subject) params.push(`subject=${encodeURIComponent(c.subject)}`)
  if (body) params.push(`body=${encodeURIComponent(body)}`)
  return (
    <ActionScanCard
      accent={ACCENTS.email}
      icon={Mail}
      eyebrow="Email"
      headline={c.subject || 'Send an email'}
      value={to}
      valueLabel="To"
      message={body}
      messageLabel={c.subject ? `Subject: ${c.subject}` : 'Message'}
      editableMessage
      onMessageChange={setBody}
      messagePlaceholder="Write your email…"
      action={
        to
          ? {
              href: `mailto:${to}${params.length ? `?${params.join('&')}` : ''}`,
              icon: Mail,
              label: 'Compose email',
            }
          : null
      }
      reassurance="Opens your mail app with this ready — nothing is sent until you send it"
      copyValue={to}
      copyLabel="Tap to copy the address"
    />
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
    case 'whatsapp':
      return <WhatsappCard c={c} />
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
      return <EmailCard c={c} />
    case 'sms':
      return <SmsCard c={c} />
    case 'phone':
      return <PhoneCard c={c} />
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

  // Whoever scanned this is looking at one person's card or one event, but the
  // tab kept saying "Create QR" — the wrong thing to have sitting in a history
  // list or a row of open tabs.
  useEffect(() => {
    if (!qr) return undefined
    const c = qr.content || {}
    const subject =
      [c.firstName, c.lastName].filter(Boolean).join(' ') ||
      c.title ||
      qr.name ||
      'Scanned code'
    document.title = `${subject} — Liffto`
    return () => {
      document.title = 'LIFFTO — Create QR'
    }
  }, [qr])

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
