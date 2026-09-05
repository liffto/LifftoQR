import { Check, Sparkles, Infinity as InfinityIcon, Mail } from 'lucide-react'
import Layout from '../components/Layout'
import {
  RASTER_FORMATS,
  DOWNLOAD_SIZE,
  FRAME_STYLE_COUNT,
  PATTERN_OPTIONS,
} from '../lib/qr'
import { SELECTABLE_QR_TYPES } from '../lib/qrTypes'

const SUPPORT_EMAIL = 'support@liffto.com'

// "PNG, JPEG or WEBP" — an Oxford-comma-free list for prose.
const listFormats = (formats) =>
  formats.length < 2
    ? formats.join('')
    : `${formats.slice(0, -1).join(', ')} or ${formats[formats.length - 1]}`

// One account type, everything on. Listed as capabilities rather than tiers so
// there is nothing here to compare, upgrade to, or be upsold into.
//
// Four of these used to be untrue: "API access", "White-label QR codes", "Bulk
// creation" and "Priority support". None of them exist — there are no API keys
// to issue, nothing removes branding, the create flow builds one code at a
// time, and support is the same mailto for everyone. Worse, the Integration
// page and the FAQ already said so in as many words, so the app was
// contradicting itself in front of the people paying attention.
//
// The counts are read from the code that implements them, the way the FAQ reads
// its download formats. A list of capabilities maintained by hand drifts from
// the product the moment either changes, which is how this page got here.
const INCLUDED = [
  'Unlimited QR codes',
  'Dynamic & static QR codes',
  `${SELECTABLE_QR_TYPES.length} QR code types`,
  `Logos, ${PATTERN_OPTIONS.length} patterns and ${FRAME_STYLE_COUNT} frames`,
  'Saved design templates',
  `${listFormats(RASTER_FORMATS)} at ${DOWNLOAD_SIZE}px, plus SVG vector`,
  'Editable destinations after printing',
  'Live scan counts, total and unique',
  'Switch any dynamic code on or off',
  'No ads, no watermarks, no credit card',
]

// Said plainly rather than left for someone to discover. These are the things
// people ask for that the answer is currently no to.
// No articles — the sentence below supplies "no" in front of each.
const NOT_YET = ['public API', 'bulk creation', 'white-label codes']

export default function Payment() {
  return (
    <Layout breadcrumb="Subscription">
      {/* Everything-included banner */}
      <div className="relative overflow-hidden rounded-[10px] mb-6 bg-gradient-to-r from-[#1B59F5] via-[#2563eb] to-[#7c3aed] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-24 h-28 w-28 rounded-full bg-white/5" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles size={12} className="shrink-0" />
            Every feature unlocked
          </div>

          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
            Liffto is free
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
            There are no plans to compare and nothing to upgrade. Every feature
            below is already active on your account — no limits, no credit card.
          </p>
        </div>
      </div>

      {/* What you get */}
      <div className="rounded-[10px] bg-surface p-6 shadow-card sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
            <InfinityIcon size={19} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">What you get</h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              Included on every account
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-success/10">
                <Check size={11} className="text-success" strokeWidth={3} />
              </span>
              <span className="text-sm leading-snug text-ink-soft">{f}</span>
            </li>
          ))}
        </ul>

        {/* The other half of an honest capability list. Matches what the
            Integration page and the FAQ already say, so the three pages agree. */}
        <div className="mt-6 rounded-[10px] border border-line bg-canvas p-4">
          <p className="text-sm font-medium text-ink">Not here yet</p>
          <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
            There is no {NOT_YET.slice(0, -1).join(', no ')} and no{' '}
            {NOT_YET.at(-1)}. If one of those is what you need, say so — that is
            what decides the order they get built in.
          </p>
          <a
            href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Feature request')}`}
            className="mt-3 inline-flex h-9 items-center gap-2 rounded-[10px] border border-line px-4 text-sm font-semibold text-ink-soft transition-colors hover:border-primary hover:text-primary"
          >
            <Mail size={15} /> {SUPPORT_EMAIL}
          </a>
        </div>
      </div>
    </Layout>
  )
}
