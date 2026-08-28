import { useState } from 'react'
import {
  ChevronDown,
  HelpCircle,
  Zap,
  Palette,
  CreditCard,
  BarChart2,
} from 'lucide-react'
import Layout from '../components/Layout'
import { RASTER_FORMATS, DOWNLOAD_SIZE } from '../lib/qr'

// "PNG, JPEG or WEBP" — an Oxford-comma-free list for prose.
const listFormats = (formats) =>
  formats.length < 2
    ? formats.join('')
    : `${formats.slice(0, -1).join(', ')} or ${formats[formats.length - 1]}`

const CATEGORIES = [
  {
    label: 'QR Basics',
    icon: Zap,
    iconCls: 'bg-primary/10 text-primary',
    items: [
      {
        q: 'What is the difference between Static and Dynamic QR codes?',
        a: 'Static QR codes encode the destination URL directly into the pattern — once printed they cannot be changed. Dynamic QR codes store a short redirect URL so you can update the destination, track scan analytics, and even redirect to different pages at any time without reprinting.',
      },
      {
        q: 'Do QR codes expire?',
        a: 'Static QR codes never expire because the data is embedded in the image. Dynamic QR codes are tied to your account — they remain active as long as your account is active.',
      },
      {
        q: 'What happens if I delete a Dynamic QR code?',
        a: 'Deleting a Dynamic QR code deactivates the short redirect URL immediately. Anyone who scans the printed QR code after deletion will see an error page. This action cannot be undone, so duplicate the record first if you need a backup.',
      },
    ],
  },
  {
    label: 'Design & Downloads',
    icon: Palette,
    iconCls: 'bg-violet-50 text-violet-500',
    items: [
      {
        q: 'How do I download my QR code in high quality?',
        // Read from the formats the download button actually offers. This
        // promised PDF, which the app has never exported, and left out WEBP,
        // which it does — a list written from memory rather than from the code.
        a: `Click the Download button on any QR code in your dashboard. ${listFormats(RASTER_FORMATS)} give you an image rendered at ${DOWNLOAD_SIZE}px, which stays sharp well past business-card size. SVG is vector, so it scales to anything at all — that is the one to use for large-format printing.`,
      },
      {
        q: 'Can I customise the design and colours of my QR code?',
        a: 'Yes — in the Design step you can change foreground/background colours, corner styles, dot patterns, add your brand logo in the centre, and apply a frame with a call-to-action label.',
      },
    ],
  },
  {
    label: 'Plans & Pricing',
    icon: CreditCard,
    iconCls: 'bg-amber-50 text-amber-500',
    items: [
      {
        q: 'How many QR codes can I create?',
        a: 'As many as you like — there is no limit. Dynamic QR codes, analytics and every download format are included too. Liffto is free, with no plans to compare and nothing to upgrade.',
      },
    ],
  },
  {
    label: 'Analytics & API',
    icon: BarChart2,
    iconCls: 'bg-success/10 text-success',
    items: [
      {
        q: 'How do I track how many times my QR code was scanned?',
        // Was: "Detailed analytics (time, location, device) are available on
        // Pro and Enterprise plans." Nothing about that was true. A scan
        // increments a single counter on the code — no row is written per
        // scan, so there is no time, location or device to report even in
        // principle. And the answer two above this one says Liffto is free with
        // no plans, so the page was contradicting itself.
        a: 'Dynamic QR codes count their scans. The total for each one is on your dashboard and updates live as it happens. Individual scans are not recorded, so there is no breakdown by time, location or device.',
      },
      {
        q: 'Can I use the API to create QR codes programmatically?',
        // Was: "your API keys are available in the Integration page. Full REST
        // API documentation ... is linked there." There are no keys to issue,
        // no documented endpoints, and nothing linked — the Integration page is
        // a webhook form that does not call anything yet.
        a: 'Not at the moment. There are no API keys to issue and no public endpoints published, so creating and managing codes is done through the dashboard. If this is something you need, tell us at support@liffto.com.',
      },
    ],
  },
]

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 px-5 text-left gap-4 hover:bg-canvas/50 transition-colors"
      >
        <span
          className={`text-sm font-medium transition-colors leading-snug ${open ? 'text-primary' : 'text-ink'}`}
        >
          {q}
        </span>
        <ChevronDown
          size={17}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180 text-primary' : 'text-ink-faint'}`}
        />
      </button>
      {open && (
        <p className="pb-5 px-5 text-sm text-ink-soft leading-relaxed pr-10">
          {a}
        </p>
      )}
    </div>
  )
}

export default function FAQ() {
  return (
    <Layout breadcrumb="FAQ">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-[10px] shadow-card px-5 py-5 sm:px-8 sm:py-7 mb-5 flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
            <HelpCircle size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg">
              Frequently Asked Questions
            </h2>
            <p className="text-sm text-ink-soft mt-0.5">
              Can't find an answer?{' '}
              <a
                href="mailto:support@liffto.com"
                className="text-primary hover:underline"
              >
                support@liffto.com
              </a>
            </p>
          </div>
        </div>

        {/* Categorised FAQ */}
        <div className="flex flex-col gap-4">
          {CATEGORIES.map(({ label, icon: Icon, iconCls, items }) => (
            <div
              key={label}
              className="bg-white rounded-[10px] shadow-card overflow-hidden"
            >
              {/* Category header */}
              <div className="flex items-center gap-3 px-5 py-4 border-b border-line">
                <div
                  className={`w-7 h-7 rounded-[10px] flex items-center justify-center shrink-0 ${iconCls}`}
                >
                  <Icon size={14} />
                </div>
                <h3 className="text-sm font-semibold text-ink">{label}</h3>
                <span className="ml-auto text-xs text-ink-faint">
                  {items.length} {items.length === 1 ? 'question' : 'questions'}
                </span>
              </div>
              {items.map((item) => (
                <FaqItem key={item.q} q={item.q} a={item.a} />
              ))}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
