// Pure (React-free) QR content type registry: field schemas + payload encoders.
// Every encoder produces a string that a normal phone camera/QR scanner natively
// recognises (WIFI:, vCard 3.0, mailto:, SMSTO:, tel:, geo:, VEVENT, wa.me, …).
// Encoders were produced and adversarially verified for scanner-correct escaping.
//
// Kept free of any React/icon imports so it can be unit-tested directly in Node.
// The UI layer (qrTypes.js) attaches lucide icons on top of this.

import {
  digitsOnly,
  findByDial,
  isValidNationalNumber,
  isValidPhone,
} from './countries'

// Country list for the vCard "Country" dropdown. "India" leads the list (and
// is the field's default) to match the rest of the app's sample data; the
// remainder is alphabetical.
const COUNTRIES = [
  'India',
  'Afghanistan',
  'Albania',
  'Algeria',
  'Argentina',
  'Armenia',
  'Australia',
  'Austria',
  'Azerbaijan',
  'Bahrain',
  'Bangladesh',
  'Belarus',
  'Belgium',
  'Bolivia',
  'Bosnia and Herzegovina',
  'Brazil',
  'Bulgaria',
  'Cambodia',
  'Cameroon',
  'Canada',
  'Chile',
  'China',
  'Colombia',
  'Costa Rica',
  'Croatia',
  'Cuba',
  'Cyprus',
  'Czech Republic',
  'Denmark',
  'Dominican Republic',
  'Ecuador',
  'Egypt',
  'El Salvador',
  'Estonia',
  'Ethiopia',
  'Finland',
  'France',
  'Georgia',
  'Germany',
  'Ghana',
  'Greece',
  'Guatemala',
  'Honduras',
  'Hong Kong',
  'Hungary',
  'Iceland',
  'Indonesia',
  'Iran',
  'Iraq',
  'Ireland',
  'Israel',
  'Italy',
  'Jamaica',
  'Japan',
  'Jordan',
  'Kazakhstan',
  'Kenya',
  'Kuwait',
  'Latvia',
  'Lebanon',
  'Lithuania',
  'Luxembourg',
  'Malaysia',
  'Malta',
  'Mexico',
  'Moldova',
  'Monaco',
  'Mongolia',
  'Morocco',
  'Myanmar',
  'Nepal',
  'Netherlands',
  'New Zealand',
  'Nigeria',
  'North Macedonia',
  'Norway',
  'Oman',
  'Pakistan',
  'Panama',
  'Paraguay',
  'Peru',
  'Philippines',
  'Poland',
  'Portugal',
  'Qatar',
  'Romania',
  'Russia',
  'Saudi Arabia',
  'Serbia',
  'Singapore',
  'Slovakia',
  'Slovenia',
  'South Africa',
  'South Korea',
  'Spain',
  'Sri Lanka',
  'Sweden',
  'Switzerland',
  'Taiwan',
  'Tanzania',
  'Thailand',
  'Tunisia',
  'Turkey',
  'Uganda',
  'Ukraine',
  'United Arab Emirates',
  'United Kingdom',
  'United States',
  'Uruguay',
  'Uzbekistan',
  'Venezuela',
  'Vietnam',
  'Yemen',
  'Zimbabwe',
]

/* ─────────────────────────────  encoders  ───────────────────────────── */

const encodeUrl = (c) => {
  let u = (c.url || '').trim()
  if (!u) return ''
  const hasAuthority = /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u)
  const knownScheme =
    /^(mailto|tel|sms|smsto|geo|bitcoin|bitcoincash|ethereum|magnet|matmsg|wtai|maps):/i.test(
      u,
    )
  if (!hasAuthority && !knownScheme) u = 'https://' + u
  return u
}

// The URL constructor alone isn't strict enough: browsers percent-encode
// invalid characters (e.g. spaces) into the hostname instead of rejecting
// them, so "not a url" parses "successfully" as host "not%20a%20url". Require
// the hostname to actually look like a domain, localhost, or an IPv4 address.
const HOSTNAME_RE =
  /^(([a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)\.)+[a-z]{2,}$|^localhost$|^(\d{1,3}\.){3}\d{1,3}$/i

// Website URL field: same tolerant "bare domain gets https:// prepended"
// rule as encodeUrl, then checked for a real hostname — so "example.com" is
// fine but "not a url" isn't.
export const isValidWebsiteUrl = (value) => {
  const v = String(value ?? '').trim()
  if (!v) return false
  try {
    const parsed = new URL(encodeUrl({ url: v }))
    return HOSTNAME_RE.test(parsed.hostname)
  } catch {
    return false
  }
}

const encodeText = (c) => String(c.text ?? '')

const encodeWifi = (c) => {
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/:/g, '\\:')
      .replace(/"/g, '\\"')
  const auth = c.auth || 'WPA'
  const hidden = String(c.hidden) === 'true' ? 'true' : 'false'
  let out = 'WIFI:T:' + auth + ';S:' + esc(c.ssid) + ';'
  if (auth !== 'nopass') out += 'P:' + esc(c.password) + ';'
  out += 'H:' + hidden + ';;'
  return out
}

const encodeVcard = (c) => {
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/\n/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
  const lines = ['BEGIN:VCARD', 'VERSION:3.0']
  const first = (c.firstName || '').trim()
  const last = (c.lastName || '').trim()
  lines.push('N:' + esc(last) + ';' + esc(first) + ';;;')
  const fn = [first, last].filter(Boolean).join(' ')
  lines.push('FN:' + esc(fn))
  if (c.org) lines.push('ORG:' + esc(c.org))
  if (c.title) lines.push('TITLE:' + esc(c.title))
  if (c.phone) lines.push('TEL;TYPE=CELL,VOICE:' + esc(c.phone))
  if (c.workPhone) lines.push('TEL;TYPE=WORK,VOICE:' + esc(c.workPhone))
  if (c.email) lines.push('EMAIL;TYPE=INTERNET:' + esc(c.email))
  if (c.url) lines.push('URL:' + esc(c.url))
  if (c.street || c.city || c.state || c.zip || c.country) {
    lines.push(
      'ADR;TYPE=HOME:;;' +
        esc(c.street) +
        ';' +
        esc(c.city) +
        ';' +
        esc(c.state) +
        ';' +
        esc(c.zip) +
        ';' +
        esc(c.country),
    )
  }
  if (c.note) lines.push('NOTE:' + esc(c.note))
  lines.push('END:VCARD')
  return lines.join('\r\n')
}

const encodeEmail = (c) => {
  const to = encodeURIComponent((c.to || '').trim()).replace(/%40/g, '@')
  const p = []
  if (c.subject) p.push('subject=' + encodeURIComponent(c.subject))
  if (c.body) p.push('body=' + encodeURIComponent(c.body))
  return 'mailto:' + to + (p.length ? '?' + p.join('&') : '')
}

const encodeSms = (c) => {
  const num = (c.number || '').replace(/[^+\d]/g, '').replace(/(?!^)\+/g, '')
  const body = (c.message || '').replace(/[\r\n]+/g, ' ')
  return `SMSTO:${num}:${body}`
}

const encodePhone = (c) => {
  const raw = (c.phone || '').trim()
  const hasPlus = raw.trimStart().startsWith('+')
  let body = raw.replace(/[^0-9*#,]/g, '')
  if (hasPlus) body = '+' + body
  return 'tel:' + body
}

const encodeWhatsapp = (c) => {
  const digits = String((c.countryCode || '') + (c.phone || '')).replace(
    /[^0-9]/g,
    '',
  )
  let url = 'https://wa.me/' + digits
  const msg = (c.message || '').trim()
  if (msg) url += '?text=' + encodeURIComponent(c.message)
  return url
}

// Event date helpers, shared by the .ics the QR encodes and the Google
// Calendar link the scan page offers. Both must read a date the same way or a
// scanner would get two different events out of one code.
const pad2 = (n) => String(n).padStart(2, '0')

const stampFromDate = (d) =>
  d.getUTCFullYear() +
  pad2(d.getUTCMonth() + 1) +
  pad2(d.getUTCDate()) +
  'T' +
  pad2(d.getUTCHours()) +
  pad2(d.getUTCMinutes()) +
  pad2(d.getUTCSeconds()) +
  'Z'

// datetime-local value ("2026-07-15T09:00") is local wall time → UTC stamp
const eventStamp = (local) => {
  if (!local) return ''
  const d = new Date(local)
  if (isNaN(d.getTime())) return ''
  return stampFromDate(d)
}

const eventDate = (local) =>
  String(local || '')
    .slice(0, 10)
    .replace(/-/g, '')

// All-day ranges are end-exclusive in both iCalendar and Google Calendar, so
// a one-day event ends on the following date.
const eventNextDay = (local) => {
  const base = String(local || '').slice(0, 10)
  const d = new Date(base + 'T00:00:00Z')
  if (isNaN(d.getTime())) return eventDate(local)
  d.setUTCDate(d.getUTCDate() + 1)
  return d.getUTCFullYear() + pad2(d.getUTCMonth() + 1) + pad2(d.getUTCDate())
}

export const isAllDayEvent = (c) => c.allDay === 'Yes' || c.allDay === true

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

// Read the parts straight out of the datetime-local string rather than through
// Date. The stored value is the wall time whoever made the code typed in, with
// no zone attached — parsing it into a Date and formatting it back would shift
// it by the *reader's* offset and show a scanner the wrong hour.
const eventParts = (local) => {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(
    String(local || ''),
  )
  if (!m) return null
  return {
    y: m[1],
    mo: +m[2],
    d: +m[3],
    time: m[4] ? `${m[4]}:${m[5]}` : '',
    day: `${+m[3]} ${MONTHS[+m[2] - 1]} ${m[1]}`,
  }
}

/**
 * The "When" line for an event, for humans rather than for a calendar app.
 *
 * Shares isAllDayEvent with googleCalendarUrl deliberately: the page and the
 * Add-to-Calendar button beneath it describe the same event, and reading the
 * all-day flag in only one of them is exactly how they came to disagree — the
 * page was printing a clock time for an event the button treated as all-day.
 *
 * Returns '' when there is no usable date, so callers can hide the row.
 */
export const formatEventWhen = (c = {}) => {
  const start = eventParts(c.start)
  if (!start) return ''
  const end = eventParts(c.end)

  if (isAllDayEvent(c)) {
    // An all-day event has no meaningful hour to show. The stored end is the
    // last day itself — the exclusive end is a calendar-format detail that
    // belongs in the link, not on the page.
    if (end && end.day !== start.day) {
      return `${start.day} – ${end.day} · All day`
    }
    return `${start.day} · All day`
  }

  if (!start.time) return start.day
  if (!end || !end.time) return `${start.day} · ${start.time}`
  if (end.day === start.day) {
    return `${start.day} · ${start.time} – ${end.time}`
  }
  return `${start.day} · ${start.time} – ${end.day} · ${end.time}`
}

/**
 * "Add to Google Calendar" link for an event's content.
 *
 * Google's template URL wants one `dates=START/END` range: UTC stamps for a
 * timed event, bare dates for an all-day one. Both ends are required — a range
 * with a blank half opens a form with nothing filled in — so a missing end is
 * filled in rather than passed through empty.
 *
 * Returns null when there is no usable start, so callers can hide the button
 * instead of offering a link to an empty calendar form.
 */
// A timestamp for a stored wall-clock string.
//
// The stored value carries no timezone — a datetime-local input never does — so
// it is read in the timezone of whoever is looking. That is the same assumption
// formatEventWhen already makes when it prints the stored time back verbatim:
// right for anyone in the event's own timezone, and off by the difference for
// anyone else. Fixing that properly means asking the organiser for a timezone,
// which is a change to the create form and the stored shape, not to this.
const eventMoment = (local, { endOfDay = false } = {}) => {
  const p = eventParts(local)
  if (!p) return null
  const [h, min] = p.time ? p.time.split(':').map(Number) : [0, 0]
  const d = new Date(+p.y, p.mo - 1, p.d, h, min, 0, 0)
  if (endOfDay) d.setHours(23, 59, 59, 999)
  return d.getTime()
}

/**
 * Where an event sits relative to now: 'upcoming', 'now', 'ended', or null when
 * there is no usable start date to judge by.
 *
 * The scanned page showed the same card forever, so a code on a poster for last
 * month's thing still read as an invitation and still offered to put it in your
 * calendar. A QR code outlives the event it was printed for; the page it opens
 * has to admit that.
 */
export const eventStatus = (c = {}, now = Date.now()) => {
  const start = eventMoment(c.start)
  if (start == null) return null

  const allDay = isAllDayEvent(c)
  // An all-day event runs to the end of its last day, and the stored end is
  // that day itself. A timed event with no end is treated as lasting the rest
  // of its day rather than ending the instant it starts — the field is
  // required, but a record saved before it was, or edited around, should not
  // read as over the minute it begins.
  const end = allDay
    ? eventMoment(c.end || c.start, { endOfDay: true })
    : (eventMoment(c.end) ?? eventMoment(c.start, { endOfDay: true }))

  if (now < start) return 'upcoming'
  if (end != null && now > end) return 'ended'
  return 'now'
}

export const googleCalendarUrl = (c = {}) => {
  const allDay = isAllDayEvent(c)
  let start, end

  if (allDay) {
    start = eventDate(c.start)
    if (!start) return null
    // End-exclusive, and a missing end means the event is that single day.
    end = c.end ? eventNextDay(c.end) : eventNextDay(c.start)
  } else {
    start = eventStamp(c.start)
    if (!start) return null
    end = eventStamp(c.end)
    if (!end) {
      // No end given: an hour is the least surprising default, and matches
      // what Google itself assumes for a bare start time.
      const d = new Date(c.start)
      d.setHours(d.getHours() + 1)
      end = stampFromDate(d)
    }
  }

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: String(c.title || 'Event'),
    dates: `${start}/${end}`,
  })
  if (c.description) params.set('details', String(c.description))
  if (c.location) params.set('location', String(c.location))

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

const encodeEvent = (c) => {
  const esc = (s) =>
    String(s == null ? '' : s)
      .replace(/\\/g, '\\\\')
      .replace(/\r\n|\n|\r/g, '\\n')
      .replace(/,/g, '\\,')
      .replace(/;/g, '\\;')
  const stampOf = eventStamp
  const toDate = eventDate
  const nextDay = eventNextDay
  const allDay = isAllDayEvent(c)
  const slug =
    String(c.title || 'event')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 40) || 'event'
  const uid = slug + '-' + (toDate(c.start) || 'x') + '@liffto.qr'
  const dtstamp = stampOf(c.start) || stampOf(c.end)
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Liffto//QR//EN',
    'BEGIN:VEVENT',
  ]
  lines.push('UID:' + uid)
  if (dtstamp) lines.push('DTSTAMP:' + dtstamp)
  lines.push('SUMMARY:' + esc(c.title))
  if (c.location) lines.push('LOCATION:' + esc(c.location))
  if (c.description) lines.push('DESCRIPTION:' + esc(c.description))
  if (allDay) {
    if (c.start) lines.push('DTSTART;VALUE=DATE:' + toDate(c.start))
    if (c.end) lines.push('DTEND;VALUE=DATE:' + nextDay(c.end))
  } else {
    if (c.start) lines.push('DTSTART:' + stampOf(c.start))
    if (c.end) lines.push('DTEND:' + stampOf(c.end))
  }
  lines.push('END:VEVENT', 'END:VCALENDAR')
  return lines.join('\r\n')
}

const encodeLocation = (c) => {
  const f = (n) => String(n == null ? '' : n).trim()
  const lat = f(c.lat),
    lng = f(c.lng)
  if (!lat && !lng) return ''
  const base = `geo:${lat},${lng}`
  const label = f(c.label)
  if (!label) return base
  const enc = encodeURIComponent(label)
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29')
  return `${base}?q=${lat},${lng}(${enc})`
}

const encodeSocial = (c) => {
  const clean = (s) => (s == null ? '' : String(s).trim())
  const ensureScheme = (u) =>
    /^https?:\/\//i.test(u) ? u : 'https://' + u.replace(/^\/+/, '')
  const platform = clean(c.platform).toLowerCase() || 'instagram'
  const rawUrl = clean(c.url)
  if (rawUrl) return ensureScheme(rawUrl)
  if (platform === 'other') return ''
  const hosts = {
    instagram: 'instagram.com',
    x: 'x.com',
    facebook: 'facebook.com',
    tiktok: 'tiktok.com',
    linkedin: 'linkedin.com/in',
    youtube: 'youtube.com',
    snapchat: 'snapchat.com/add',
    pinterest: 'pinterest.com',
    threads: 'threads.net',
    github: 'github.com',
    whatsapp: 'wa.me',
    telegram: 't.me',
  }
  const host = hosts[platform]
  if (!host) return ''
  let h = clean(c.handle)
  h = h.replace(/^https?:\/\/[^/]+\//i, '')
  h = h.replace(
    /^(?:www\.)?(?:instagram|x|twitter|facebook|fb|tiktok|linkedin|youtube|youtu|snapchat|pinterest|threads|github|wa|t|telegram)\.[a-z.]{2,}\//i,
    '',
  )
  h = h.replace(/^@+/, '').replace(/^\/+|\/+$/g, '')
  if (!h) return ''
  if (platform === 'whatsapp') {
    const digits = h.replace(/[^0-9]/g, '')
    return digits ? 'https://wa.me/' + digits : ''
  }
  const at = platform === 'tiktok' || platform === 'youtube' ? '@' : ''
  const seg = h
    .split('/')
    .map((p) => encodeURIComponent(p))
    .join('/')
  return 'https://' + host + '/' + at + seg
}

// Generic "ensure https scheme, percent-encode spaces" link encoder
const normLink = (raw) => {
  let u = String(raw == null ? '' : raw).trim()
  if (!u) return ''
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(u))
    u = 'https://' + u.replace(/^\/+/, '')
  return u.replace(/ /g, '%20')
}

const linkEncoder = (c) => normLink(c.url)

// App: OS-aware routing (Android → Play Store, iOS → App Store) needs the
// dynamic redirect, which inspects both stored links at scan time. The static
// fallback below is the single best link used when dynamic is off.
const encodeApp = (c) => normLink(c.fallbackUrl || c.iosUrl || c.androidUrl)

// Link Tree: the multi-link page is served by the dynamic redirect. The static
// fallback returns the first link in the list.
const encodeLinktree = (c) => {
  const links = Array.isArray(c.links) ? c.links : []
  const first = links
    .map((l) => (l && l.url ? String(l.url) : '').trim())
    .find(Boolean)
  return normLink(first)
}

const encodeGoogleReview = (c) => {
  const raw = (c.url || '').trim()
  if (!raw) return ''
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw) ? raw : 'https://' + raw
}

const encodePdf = (c) => {
  let u = (c.url || '').trim()
  if (!u) return ''
  if (/^http:\/\//i.test(u)) u = 'https://' + u.slice(7)
  else if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(u)) u = 'https://' + u
  return u.replace(/ /g, '%20')
}

const encodeVideo = (c) => {
  const raw = (c.url || '').trim()
  if (!raw) return ''
  return /^https?:\/\//i.test(raw) ? raw : 'https://' + raw
}

const encodeMp3 = (c) => {
  const raw = (c.url || '').trim()
  if (!raw) return ''
  return /^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw) ? raw : 'https://' + raw
}

const encodeInvitation = (c) => {
  let u = (c.url || '').trim()
  if (!u) return ''
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u)) u = 'https://' + u
  return u.replace(/ /g, '%20')
}

const encodeCoupon = (c) => {
  const oneLine = (s) =>
    String(s == null ? '' : s)
      .replace(/\r\n?/g, '\n')
      .replace(/\n+/g, ' ')
      .trim()
  const fmtDate = (s) => {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim())
    if (!m) return ''
    const y = parseInt(m[1], 10),
      mo = parseInt(m[2], 10),
      d = parseInt(m[3], 10)
    if (mo < 1 || mo > 12 || d < 1 || d > 31) return ''
    const months = [
      'Jan',
      'Feb',
      'Mar',
      'Apr',
      'May',
      'Jun',
      'Jul',
      'Aug',
      'Sep',
      'Oct',
      'Nov',
      'Dec',
    ]
    return `${d} ${months[mo - 1]} ${y}`
  }
  const lines = []
  const title = oneLine(c.title)
  if (title) lines.push(title)
  const code = oneLine(c.code)
  if (code) lines.push(`Code: ${code}`)
  const exp = fmtDate(c.expiry)
  if (exp) lines.push(`Expires: ${exp}`)
  const desc = oneLine(c.description)
  if (desc) lines.push(desc)
  let url = String(c.url == null ? '' : c.url).trim()
  if (url) {
    if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(url)) url = `https://${url}`
    lines.push(url)
  }
  return lines.join('\n')
}

const encodeFeedback = (c) => {
  let url = (c.url || '').trim()
  if (url && !/^https?:\/\//i.test(url)) url = 'https://' + url
  if (c.prefillKey && c.prefillValue) {
    const sep = url.includes('?') ? '&' : '?'
    url +=
      sep +
      encodeURIComponent(c.prefillKey) +
      '=' +
      encodeURIComponent(c.prefillValue)
  }
  return url
}

/* ─────────────────────────────  derive names  ───────────────────────────── */

const nameUrl = (c) => {
  let u = (c.url || '').trim()
  if (!u) return 'URL'
  try {
    const h = new URL(
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u) ? u : 'https://' + u,
    ).hostname.replace(/^www\./, '')
    return h || 'URL'
  } catch (e) {
    return (
      u
        .replace(/^https?:\/\//, '')
        .replace(/^www\./, '')
        .split('/')[0]
        .slice(0, 40) || 'URL'
    )
  }
}
const nameText = (c) => {
  const t = String(c.text ?? '')
    .replace(/\s+/g, ' ')
    .trim()
  return t ? (t.length > 30 ? t.slice(0, 30) + '…' : t) : 'Text'
}
// Names carry no type prefix. Every screen that shows a name shows the type
// beside it — an icon and a label in the list, a badge in the details dialog —
// so "WhatsApp: +919843137477" spent its first eleven characters repeating the
// word next to it and pushed the number that identifies the code out of a
// narrow column. The fallbacks still name the type, because with no content
// the type is the only thing there is to say.
const nameWifi = (c) => (c.ssid || '').trim() || 'Wi-Fi network'
const nameVcard = (c) => {
  const n = [c.firstName, c.lastName].filter(Boolean).join(' ').trim()
  return n || c.org || 'Contact card'
}
const nameEmail = (c) => (c.to || '').trim() || 'Email'
const nameSms = (c) => (c.number || '').trim() || 'SMS'
const namePhone = (c) => (c.phone || '').trim() || 'Phone'
const nameWhatsapp = (c) => {
  const d = String((c.countryCode || '') + (c.phone || '')).replace(
    /[^0-9]/g,
    '',
  )
  return d ? '+' + d : 'WhatsApp'
}
const nameEvent = (c) => (c.title || '').trim() || 'Calendar event'
const nameLocation = (c) => {
  const l = (c && c.label ? String(c.label) : '').trim()
  if (l) return l
  const lat = (c && c.lat != null ? String(c.lat) : '').trim()
  const lng = (c && c.lng != null ? String(c.lng) : '').trim()
  return lat && lng ? `${lat}, ${lng}` : 'Location'
}
const nameSocial = (c) => {
  const p = (c && c.platform ? String(c.platform) : 'social').toLowerCase()
  const names = {
    instagram: 'Instagram',
    x: 'X',
    facebook: 'Facebook',
    tiktok: 'TikTok',
    linkedin: 'LinkedIn',
    youtube: 'YouTube',
    snapchat: 'Snapchat',
    pinterest: 'Pinterest',
    threads: 'Threads',
    github: 'GitHub',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    other: 'Social',
  }
  const label = names[p] || 'Social'
  const h = c && c.handle ? String(c.handle).trim().replace(/^@+/, '') : ''
  return h ? label + ': @' + h : label + ' profile'
}
const nameGoogleReview = (c) =>
  (c.businessName || '').trim() || 'Google Review'
const namePdf = (c) => {
  const u = (c.url || '').trim()
  if (!u) return 'PDF'
  try {
    const p = new URL(/^[a-z][a-z0-9+.-]*:\/\//i.test(u) ? u : 'https://' + u)
    const file = p.pathname.split('/').filter(Boolean).pop()
    return file ? decodeURIComponent(file) : p.hostname
  } catch (e) {
    return u.replace(/^https?:\/\//i, '').slice(0, 40)
  }
}
const nameVideo = (c) => {
  const raw = (c.url || '').trim()
  if (!raw) return 'Video'
  try {
    const u = new URL(/^https?:\/\//i.test(raw) ? raw : 'https://' + raw)
    return u.hostname.replace(/^www\./, '')
  } catch (e) {
    return 'Video'
  }
}
const nameMp3 = (c) => {
  const t = (c.title || '').trim()
  if (t) return t
  const u = (c.url || '').trim()
  if (!u) return 'Audio'
  const file = u.split('?')[0].split('#')[0].split('/').filter(Boolean).pop()
  return file || u
}
const nameApp = (c) => {
  const n = (c.name || '').trim()
  if (n) return n
  const u = (c.iosUrl || c.androidUrl || c.fallbackUrl || '').trim()
  if (!u) return 'App download'
  try {
    return new URL(
      /^https?:\/\//i.test(u) ? u : 'https://' + u,
    ).hostname.replace(/^www\./, '')
  } catch (e) {
    return 'App download'
  }
}
const nameLinktree = (c) => {
  const t = (c.title || '').trim()
  if (t) return t
  const n = Array.isArray(c.links)
    ? c.links.filter((l) => l && String(l.url || '').trim()).length
    : 0
  return n ? `Link Tree (${n} link${n > 1 ? 's' : ''})` : 'Link Tree'
}
const nameCoupon = (c) => {
  const t = String(c.title || '').trim()
  const code = String(c.code || '').trim()
  if (t && code) return `${t} (${code})`
  if (t) return t
  if (code) return code
  return 'Coupon'
}
const nameInvitation = (c) => {
  const t = (c.title || '').trim()
  if (t) return t
  const u = (c.url || '').trim()
  if (!u) return 'Invitation'
  try {
    const h = new URL(
      /^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(u) ? u : 'https://' + u,
    ).hostname.replace(/^www\./, '')
    return h
  } catch (e) {
    return 'Invitation'
  }
}
const nameFeedback = (c) => {
  try {
    const u = new URL(
      /^https?:\/\//i.test(c.url || '') ? c.url : 'https://' + (c.url || ''),
    )
    return u.hostname.replace(/^www\./, '')
  } catch (e) {
    return 'Feedback Form'
  }
}

/* ─────────────────────────────  registry  ───────────────────────────── */

export const ENCODERS = [
  {
    key: 'url',
    label: 'Website URL',
    subtitle: 'Open a link',
    kind: 'link',
    iconName: 'Link2',
    dynamicCapable: true,
    fields: [
      {
        key: 'url',
        label: 'Website URL',
        inputType: 'url',
        placeholder: 'https://example.com',
        required: true,
      },
    ],
    encode: encodeUrl,
    deriveName: nameUrl,
  },

  {
    key: 'text',
    label: 'Text',
    subtitle: 'Plain text',
    kind: 'data',
    iconName: 'Type',
    dynamicCapable: true,
    // Static by default — the code carries the message, the number or the
    // address in its own pattern and needs no server. Turning it dynamic
    // routes it through a short link instead, which is what buys the things a
    // printed code cannot otherwise have: a destination you can correct after
    // printing, a scan count, and an off switch. Scanning one lands on our own
    // page rather than firing the action immediately — see
    // ALWAYS_LANDING_TYPE_KEYS in the API for why.
    fields: [
      {
        key: 'text',
        label: 'Text',
        inputType: 'textarea',
        placeholder: 'Enter any text to encode in the QR code',
        required: true,
      },
    ],
    encode: encodeText,
    deriveName: nameText,
  },

  {
    key: 'wifi',
    label: 'Wi-Fi',
    subtitle: 'Network login',
    kind: 'data',
    iconName: 'Wifi',
    dynamicCapable: false,
    fields: [
      {
        key: 'ssid',
        label: 'Network name (SSID)',
        inputType: 'text',
        placeholder: 'MyHomeWiFi',
        required: true,
      },
      {
        key: 'auth',
        label: 'Security',
        inputType: 'select',
        options: ['WPA', 'WEP', 'nopass'],
        defaultValue: 'WPA',
        required: true,
        half: true,
      },
      {
        key: 'hidden',
        label: 'Hidden network',
        inputType: 'select',
        options: ['false', 'true'],
        defaultValue: 'false',
        half: true,
      },
      {
        key: 'password',
        label: 'Password',
        inputType: 'password',
        placeholder: 'Network password',
      },
    ],
    encode: encodeWifi,
    deriveName: nameWifi,
  },

  {
    key: 'vcard',
    label: 'Contact Card',
    subtitle: 'vCard contact',
    kind: 'data',
    iconName: 'Contact',
    dynamicCapable: true,
    requiresDynamic: true,
    note: 'Scanning opens a branded contact page with a one-tap Save Contact button. Always a Dynamic QR.',
    fields: [
      {
        key: 'photo',
        label: 'Profile photo',
        inputType: 'image',
        shape: 'circle',
        half: true,
      },
      { key: 'logo', label: 'Company logo', inputType: 'image', half: true },
      {
        key: 'firstName',
        label: 'First name',
        inputType: 'text',
        placeholder: 'Jane',
        required: true,
        half: true,
      },
      {
        key: 'lastName',
        label: 'Last name',
        inputType: 'text',
        placeholder: 'Doe',
        half: true,
      },
      {
        key: 'org',
        label: 'Organization',
        inputType: 'text',
        placeholder: 'Acme Inc.',
        half: true,
      },
      {
        key: 'title',
        label: 'Job title',
        inputType: 'text',
        placeholder: 'Product Manager',
        half: true,
      },
      {
        key: 'phone',
        label: 'Mobile phone',
        inputType: 'phone',
        half: true,
      },
      {
        key: 'workPhone',
        label: 'Work phone',
        inputType: 'phone',
        half: true,
      },
      {
        key: 'email',
        label: 'Email',
        inputType: 'email',
        placeholder: 'jane@acme.com',
      },
      {
        key: 'url',
        label: 'Website',
        inputType: 'url',
        placeholder: 'https://acme.com',
      },
      {
        key: 'street',
        label: 'Street address',
        inputType: 'text',
        placeholder: '123 Main St',
      },
      {
        key: 'city',
        label: 'City',
        inputType: 'text',
        placeholder: 'Springfield',
        half: true,
      },
      {
        key: 'state',
        label: 'State / Region',
        inputType: 'text',
        placeholder: 'IL',
        half: true,
      },
      {
        key: 'zip',
        label: 'Postal code',
        inputType: 'text',
        placeholder: '62704',
        half: true,
      },
      {
        key: 'country',
        label: 'Country',
        inputType: 'select',
        options: COUNTRIES,
        defaultValue: 'India',
        half: true,
      },
      {
        key: 'note',
        label: 'Note',
        inputType: 'textarea',
        placeholder: 'Met at conference',
      },
    ],
    encode: encodeVcard,
    deriveName: nameVcard,
  },

  {
    key: 'email',
    label: 'Email',
    subtitle: 'Compose email',
    kind: 'data',
    iconName: 'Mail',
    dynamicCapable: true,
    // Static by default — the code carries the message, the number or the
    // address in its own pattern and needs no server. Turning it dynamic
    // routes it through a short link instead, which is what buys the things a
    // printed code cannot otherwise have: a destination you can correct after
    // printing, a scan count, and an off switch. Scanning one lands on our own
    // page rather than firing the action immediately — see
    // ALWAYS_LANDING_TYPE_KEYS in the API for why.
    fields: [
      {
        key: 'to',
        label: 'Recipient email',
        inputType: 'email',
        placeholder: 'name@example.com',
        required: true,
      },
      {
        key: 'subject',
        label: 'Subject',
        inputType: 'text',
        placeholder: 'e.g. Quote request',
      },
      {
        key: 'body',
        label: 'Message',
        inputType: 'textarea',
        placeholder: 'Type the email body…',
      },
    ],
    encode: encodeEmail,
    deriveName: nameEmail,
  },

  {
    key: 'sms',
    label: 'SMS',
    subtitle: 'Pre-filled text',
    kind: 'data',
    iconName: 'MessageSquare',
    dynamicCapable: true,
    // Static by default — the code carries the message, the number or the
    // address in its own pattern and needs no server. Turning it dynamic
    // routes it through a short link instead, which is what buys the things a
    // printed code cannot otherwise have: a destination you can correct after
    // printing, a scan count, and an off switch. Scanning one lands on our own
    // page rather than firing the action immediately — see
    // ALWAYS_LANDING_TYPE_KEYS in the API for why.
    fields: [
      {
        key: 'number',
        label: 'Phone number',
        inputType: 'phone',
        required: true,
        half: true,
      },
      {
        key: 'message',
        label: 'Message',
        inputType: 'textarea',
        placeholder: 'Pre-filled message text',
      },
    ],
    encode: encodeSms,
    deriveName: nameSms,
  },

  {
    key: 'phone',
    label: 'Phone',
    subtitle: 'Start a call',
    kind: 'data',
    iconName: 'Phone',
    dynamicCapable: true,
    // Static by default — the code carries the message, the number or the
    // address in its own pattern and needs no server. Turning it dynamic
    // routes it through a short link instead, which is what buys the things a
    // printed code cannot otherwise have: a destination you can correct after
    // printing, a scan count, and an off switch. Scanning one lands on our own
    // page rather than firing the action immediately — see
    // ALWAYS_LANDING_TYPE_KEYS in the API for why.
    fields: [
      {
        key: 'phone',
        label: 'Phone number',
        inputType: 'phone',
        required: true,
      },
    ],
    encode: encodePhone,
    deriveName: namePhone,
  },

  {
    key: 'whatsapp',
    label: 'WhatsApp',
    subtitle: 'Chat link',
    kind: 'link',
    iconName: 'MessageCircle',
    dynamicCapable: true,
    fields: [
      {
        key: 'countryCode',
        label: 'Country',
        inputType: 'dialcode',
        required: true,
        half: true,
      },
      {
        key: 'phone',
        label: 'Phone number',
        inputType: 'national',
        dialFrom: 'countryCode',
        placeholder: '5551234567',
        required: true,
        half: true,
      },
      {
        key: 'message',
        label: 'Prefilled message',
        inputType: 'textarea',
        placeholder: "Hi! I'd like to know more about...",
      },
    ],
    encode: encodeWhatsapp,
    deriveName: nameWhatsapp,
  },

  {
    key: 'event',
    label: 'Event',
    subtitle: 'Calendar invite',
    kind: 'data',
    iconName: 'Calendar',
    dynamicCapable: true,
    fields: [
      {
        key: 'title',
        label: 'Event Title',
        inputType: 'text',
        placeholder: 'Team Offsite',
        required: true,
      },
      {
        key: 'location',
        label: 'Location',
        inputType: 'text',
        placeholder: '123 Main St, San Francisco',
      },
      {
        key: 'start',
        label: 'Starts',
        inputType: 'datetime-local',
        required: true,
        half: true,
      },
      {
        key: 'end',
        label: 'Ends',
        inputType: 'datetime-local',
        required: true,
        half: true,
      },
      {
        key: 'allDay',
        label: 'All-day event',
        inputType: 'select',
        options: ['No', 'Yes'],
        defaultValue: 'No',
        half: true,
      },
      {
        key: 'description',
        label: 'Description',
        inputType: 'textarea',
        placeholder: 'Notes, agenda, dial-in details',
      },
    ],
    encode: encodeEvent,
    deriveName: nameEvent,
  },

  {
    key: 'location',
    label: 'Location',
    subtitle: 'Map point',
    kind: 'data',
    iconName: 'MapPin',
    dynamicCapable: false,
    fields: [
      {
        key: 'lat',
        label: 'Latitude',
        inputType: 'number',
        placeholder: '37.7749',
        required: true,
        half: true,
      },
      {
        key: 'lng',
        label: 'Longitude',
        inputType: 'number',
        placeholder: '-122.4194',
        required: true,
        half: true,
      },
      {
        key: 'label',
        label: 'Place name (optional)',
        inputType: 'text',
        placeholder: 'Golden Gate Bridge',
      },
    ],
    encode: encodeLocation,
    deriveName: nameLocation,
  },

  {
    key: 'social',
    label: 'Social Media',
    subtitle: 'Profile link',
    kind: 'link',
    iconName: 'Share2',
    dynamicCapable: true,
    fields: [
      {
        key: 'platform',
        label: 'Platform',
        inputType: 'select',
        options: [
          'instagram',
          'x',
          'facebook',
          'tiktok',
          'linkedin',
          'youtube',
          'snapchat',
          'pinterest',
          'threads',
          'github',
          'whatsapp',
          'telegram',
          'other',
        ],
        defaultValue: 'instagram',
        required: true,
        half: true,
      },
      {
        key: 'handle',
        label: 'Username / Handle',
        inputType: 'text',
        placeholder: 'yourname (no @)',
        half: true,
      },
      {
        key: 'url',
        label: 'Or full profile URL',
        inputType: 'url',
        placeholder: 'https://instagram.com/yourname',
      },
    ],
    encode: encodeSocial,
    deriveName: nameSocial,
  },

  {
    key: 'google-review',
    label: 'Google Review',
    subtitle: 'Review link',
    kind: 'link',
    iconName: 'Star',
    dynamicCapable: true,
    fields: [
      {
        key: 'url',
        label: 'Google Review URL',
        inputType: 'url',
        placeholder: 'https://g.page/r/XXXX/review',
        required: true,
      },
      {
        key: 'businessName',
        label: 'Business Name (optional)',
        inputType: 'text',
        placeholder: 'Acme Coffee Co.',
      },
    ],
    encode: encodeGoogleReview,
    deriveName: nameGoogleReview,
  },

  {
    key: 'pdf',
    label: 'PDF',
    subtitle: 'Open document',
    kind: 'link',
    iconName: 'FileText',
    dynamicCapable: true,
    fields: [
      {
        key: 'url',
        label: 'PDF link',
        inputType: 'url',
        placeholder: 'https://example.com/brochure.pdf',
        required: true,
      },
    ],
    encode: encodePdf,
    deriveName: namePdf,
  },

  {
    key: 'video',
    label: 'Video',
    subtitle: 'Hosted video',
    kind: 'link',
    iconName: 'Video',
    dynamicCapable: true,
    fields: [
      {
        key: 'url',
        label: 'Video URL',
        inputType: 'url',
        placeholder: 'https://youtu.be/dQw4w9WgXcQ',
        required: true,
      },
    ],
    encode: encodeVideo,
    deriveName: nameVideo,
  },

  {
    key: 'mp3',
    label: 'Audio',
    subtitle: 'Play a track',
    kind: 'link',
    iconName: 'Music',
    dynamicCapable: true,
    fields: [
      {
        key: 'url',
        label: 'Audio URL',
        inputType: 'url',
        placeholder: 'https://example.com/song.mp3',
        required: true,
      },
      {
        key: 'title',
        label: 'Title (optional)',
        inputType: 'text',
        placeholder: 'My Track',
      },
    ],
    encode: encodeMp3,
    deriveName: nameMp3,
  },

  {
    key: 'app',
    label: 'App',
    subtitle: 'App store link',
    kind: 'link',
    iconName: 'Smartphone',
    dynamicCapable: true,
    requiresDynamic: true,
    note: 'Scanning routes by device — Android opens the Play Store, iOS opens the App Store. Always a Dynamic QR.',
    fields: [
      {
        key: 'iosUrl',
        label: 'iOS — App Store URL',
        inputType: 'url',
        placeholder: 'https://apps.apple.com/app/id123456789',
        required: true,
      },
      {
        key: 'androidUrl',
        label: 'Android — Play Store URL',
        inputType: 'url',
        placeholder: 'https://play.google.com/store/apps/details?id=...',
        required: true,
      },
      {
        key: 'fallbackUrl',
        label: 'Desktop / other (optional)',
        inputType: 'url',
        placeholder: 'https://yourapp.com',
      },
      {
        key: 'name',
        label: 'App name (optional)',
        inputType: 'text',
        placeholder: 'My App',
      },
    ],
    encode: encodeApp,
    deriveName: nameApp,
  },

  {
    key: 'linktree',
    label: 'Link Tree',
    subtitle: 'Links page',
    kind: 'link',
    iconName: 'Link2',
    dynamicCapable: true,
    requiresDynamic: true,
    note: 'Build a mini links page — scanning opens a page listing all your links. Always a Dynamic QR.',
    fields: [
      {
        key: 'title',
        label: 'Page title (optional)',
        inputType: 'text',
        placeholder: 'My Links',
      },
      { key: 'links', label: 'Links', inputType: 'linklist', required: true },
    ],
    encode: encodeLinktree,
    deriveName: nameLinktree,
  },

  {
    key: 'coupon',
    label: 'Coupon',
    subtitle: 'Discount offer',
    kind: 'data',
    iconName: 'Ticket',
    dynamicCapable: true,
    requiresDynamic: true,
    note: 'Scanning opens a branded coupon page people can show at checkout. Always a Dynamic QR.',
    fields: [
      {
        key: 'logo',
        label: 'Brand logo (optional)',
        inputType: 'image',
        half: true,
      },
      {
        key: 'title',
        label: 'Offer title',
        inputType: 'text',
        placeholder: '20% off your next order',
        required: true,
      },
      {
        key: 'code',
        label: 'Coupon code',
        inputType: 'text',
        placeholder: 'SAVE20',
        required: true,
        half: true,
      },
      { key: 'expiry', label: 'Expires on', inputType: 'date', half: true },
      {
        key: 'description',
        label: 'Details (optional)',
        inputType: 'textarea',
        placeholder: 'Valid on orders over ₹50. One use per customer.',
      },
      {
        key: 'url',
        label: 'Redeem URL (optional)',
        inputType: 'url',
        placeholder: 'https://shop.example.com/redeem',
      },
    ],
    encode: encodeCoupon,
    deriveName: nameCoupon,
  },

  {
    key: 'invitation',
    label: 'Invitation',
    subtitle: 'Event link',
    kind: 'link',
    iconName: 'PartyPopper',
    dynamicCapable: true,
    fields: [
      {
        key: 'url',
        label: 'Invitation Link',
        inputType: 'url',
        placeholder: 'https://example.com/invite/abc123',
        required: true,
      },
      {
        key: 'title',
        label: 'Event Name (optional)',
        inputType: 'text',
        placeholder: "Sarah & Tom's Wedding",
      },
    ],
    encode: encodeInvitation,
    deriveName: nameInvitation,
  },

  {
    key: 'feedback',
    label: 'Feedback',
    subtitle: 'Feedback form',
    kind: 'link',
    iconName: 'MessageSquare',
    dynamicCapable: true,
    fields: [
      {
        key: 'url',
        label: 'Feedback Form URL',
        inputType: 'url',
        placeholder: 'https://forms.gle/your-feedback-form',
        required: true,
      },
      {
        key: 'prefillKey',
        label: 'Prefill Param Name (optional)',
        inputType: 'text',
        placeholder: 'source',
        half: true,
      },
      {
        key: 'prefillValue',
        label: 'Prefill Param Value (optional)',
        inputType: 'text',
        placeholder: 'qr-flyer',
        half: true,
      },
    ],
    encode: encodeFeedback,
    deriveName: nameFeedback,
  },
]

export const ENCODER_MAP = Object.fromEntries(ENCODERS.map((t) => [t.key, t]))

export const findEncoder = (key) => ENCODER_MAP[key] || ENCODER_MAP.url

// Build the default content object for a type (selects get their default/first option).
export const defaultContent = (key) => {
  const t = findEncoder(key)
  const out = {}
  for (const f of t.fields) {
    if (f.inputType === 'linklist') out[f.key] = [{ label: '', url: '', icon: 'website' }]
    else
      out[f.key] =
        f.defaultValue != null
          ? f.defaultValue
          : f.inputType === 'select' && f.options
            ? f.options[0]
            : ''
  }
  return out
}

// All required fields present (trimmed). A linklist needs ≥1 row with a URL.
const isFieldSatisfied = (key, field, content) => {
  if (field.inputType === 'linklist') {
    const arr = Array.isArray(content[field.key]) ? content[field.key] : []
    return arr.some((r) => r && String(r.url ?? '').trim() !== '')
  }
  if (key === 'url' && field.key === 'url') {
    return isValidWebsiteUrl(content[field.key])
  }
  if (field.inputType === 'phone') {
    return (
      isValidPhone(content[field.key]) && digitsOnly(content[field.key]) !== ''
    )
  }
  if (field.inputType === 'national') {
    const country = findByDial(content[field.dialFrom])
    const digits = digitsOnly(content[field.key])
    if (digits === '') return false
    return country ? isValidNationalNumber(country.iso, digits) : true
  }
  return String(content[field.key] ?? '').trim() !== ''
}

/**
 * Which required fields are still not satisfied.
 *
 * isComplete answers "can this be submitted"; the form also needs to answer
 * "which box is the person missing", so it can point at one instead of
 * greying out the button and leaving them to hunt. Both read the same
 * per-field rule so they cannot drift apart.
 */
export const incompleteFields = (key, content = {}) =>
  findEncoder(key)
    .fields.filter((f) => f.required && !isFieldSatisfied(key, f, content))
    .map((f) => f.key)

export const isComplete = (key, content = {}) =>
  incompleteFields(key, content).length === 0

export const encodeContent = (key, content = {}) =>
  findEncoder(key).encode(content || {})
export const deriveContentName = (key, content = {}) =>
  findEncoder(key).deriveName(content || {})
