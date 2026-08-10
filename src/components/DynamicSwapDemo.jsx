import { useState } from 'react'
import { Check, RefreshCw } from 'lucide-react'
import { defaultDesign } from '../lib/store'
import QRView from './QRView'

// The single strongest truth about a dynamic code, proven instead of claimed:
// the QR encodes a short link we host, so changing the destination leaves the
// printed pattern byte-for-byte identical. Switching destinations here visibly
// does NOT change the code — that is the whole point.

const SLUG = 'aX7f2b'

const DESTINATIONS = [
  { label: 'Summer menu', url: 'yourcafe.com/summer-menu' },
  { label: 'Autumn menu', url: 'yourcafe.com/autumn-menu' },
  { label: 'Holiday specials', url: 'yourcafe.com/holiday' },
]

// dynamic + slug => buildPayload returns the short link, so this record's QR is
// the same for every destination.
const RECORD = {
  typeKey: 'url',
  type: 'Website URL',
  dynamic: true,
  qrType: 'Dynamic QR',
  slug: SLUG,
  content: { url: 'https://yourcafe.com' },
  url: 'https://yourcafe.com',
  design: {
    ...defaultDesign(),
    bodyPattern: 'classy-rounded',
    cornerStyle: 8,
    bodyGradient: true,
    bodyColor1: '#1B59F5',
    bodyColor2: '#16C2C8',
    cornerColor1: '#1B59F5',
    logo: 'company',
  },
}

export default function DynamicSwapDemo() {
  const [active, setActive] = useState(0)
  const dest = DESTINATIONS[active]

  return (
    <div className="grid lg:grid-cols-2 gap-5">
      {/* The printed artefact — never changes */}
      <div className="rounded-2xl bg-surface border border-line p-6 sm:p-8 flex flex-col items-center justify-center">
        <div className="rounded-2xl bg-white p-5 shadow-card border border-line/60">
          <QRView record={RECORD} size={168} />
        </div>
        <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
          Printed once
        </p>
        <p className="mt-1 text-[13px] font-mono text-ink-soft">
          liffto.com/{SLUG}
        </p>
      </div>

      {/* The destination — changes freely */}
      <div className="rounded-2xl bg-surface border border-line p-6 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-ink-faint">
          Points to — change anytime
        </p>
        <div
          className="mt-4 space-y-2.5"
          role="radiogroup"
          aria-label="Destination"
        >
          {DESTINATIONS.map((d, i) => {
            const on = i === active
            return (
              <button
                key={d.url}
                type="button"
                role="radio"
                aria-checked={on}
                onClick={() => setActive(i)}
                className={`w-full flex items-center gap-3 rounded-[10px] border px-4 py-3 text-left transition-all ${
                  on
                    ? 'border-primary bg-primary/[0.06]'
                    : 'border-line hover:border-primary/40 hover:bg-canvas'
                }`}
              >
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors ${
                    on ? 'border-primary bg-primary' : 'border-line'
                  }`}
                >
                  {on && <Check size={11} className="text-white" />}
                </span>
                <span className="min-w-0">
                  <span
                    className={`block text-[14px] font-semibold ${on ? 'text-primary' : 'text-ink'}`}
                  >
                    {d.label}
                  </span>
                  <span className="block text-[12px] text-ink-muted truncate">
                    {d.url}
                  </span>
                </span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-start gap-2.5 rounded-[10px] bg-canvas px-4 py-3.5">
          <RefreshCw size={15} className="text-primary shrink-0 mt-0.5" />
          <p className="text-[13px] text-ink-soft leading-relaxed">
            The code on the left didn’t change — it never does. Anyone scanning
            the printed sticker now lands on{' '}
            <span className="font-semibold text-ink">{dest.label}</span>.
          </p>
        </div>
      </div>
    </div>
  )
}
