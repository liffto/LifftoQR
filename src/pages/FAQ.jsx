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
        a: 'A static code holds the destination inside the pattern itself, so the moment it is printed it is fixed. A dynamic code holds a short link we host — the pattern never changes while you change where it leads, count its scans, or switch it off. If what you are printing might ever need to point somewhere else, make it dynamic.',
      },
      {
        q: 'Do QR codes expire?',
        a: 'Static codes never expire; the data is in the image, so it works with or without us. Dynamic codes run through your account and stay live for as long as it does.',
      },
      {
        q: 'What happens if I delete a Dynamic QR code?',
        a: 'The short link stops working straight away, and anything already printed goes with it — a scan then lands on an error page. There is no undo, so if the code is out in the world, duplicate it before you delete it.',
      },
    ],
  },
  {
    label: 'Design & Downloads',
    icon: Palette,
    iconCls: 'bg-violet-50 text-violet-500 dark:bg-violet-400/15 dark:text-violet-300',
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
        a: 'Yes. In the Design step you can set the body and background colours or run a gradient across them, change the dot pattern and the corner style, drop your logo into the middle, and wrap the whole thing in a frame with your own call to action. Save the result as a template and the next code can wear it in one click.',
      },
    ],
  },
  {
    label: 'Plans & Pricing',
    icon: CreditCard,
    iconCls: 'bg-amber-50 text-amber-500 dark:bg-amber-400/15 dark:text-amber-300',
    items: [
      {
        q: 'How many QR codes can I create?',
        a: 'As many as you want. There is no cap, no paid tier further in, and no card field anywhere in the product — dynamic codes, scan counts and every download format are simply on.',
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
        // Rewritten twice, both times because the product moved and this did
        // not. It first claimed time/location/device breakdowns behind "Pro
        // and Enterprise plans", which never existed. It was then corrected to
        // "individual scans are not recorded" — true at the time, and false
        // since scan_event landed: every scan now writes a row with a
        // timestamp, a device type and a browser, which is what feeds the
        // 30-day graph and the unique count. Location is still the thing we
        // genuinely do not collect, and the visitor id is a one-way hash, so
        // the honest boundary is "this device", not "this person".
        a: 'Dynamic codes record every scan. On the dashboard you get a running total that moves as it happens, a unique count, and a day-by-day graph of the last 30 days. What we do not collect is location — and the id behind the unique count is a one-way hash of the device, so it tells you "a returning device", never who. Device type and browser are stored but not shown yet.',
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
        <div className="bg-surface rounded-[10px] shadow-card px-5 py-5 sm:px-8 sm:py-7 mb-5 flex items-center gap-4 sm:gap-5">
          <div className="w-12 h-12 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
            <HelpCircle size={22} className="text-primary" />
          </div>
          <div>
            <h2 className="font-bold text-ink text-lg">
              Questions, answered straight
            </h2>
            <p className="text-sm text-ink-soft mt-0.5">
              Not covered here?{' '}
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
              className="bg-surface rounded-[10px] shadow-card overflow-hidden"
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
