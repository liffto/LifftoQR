import { useState } from 'react'
import { Check, ArrowRight } from 'lucide-react'
import { QR_TYPES, findType, defaultContent } from '../lib/qrTypes'
import { Toggle } from './ui'
import DynamicQRInfo from './DynamicQRInfo'

// Starting a QR is two pieces that can be placed together (the in-app step 1)
// or apart (the landing page puts the URL card in the hero and the type grid
// further down).
//
// onStart(typeKey, content, dynamicPref, target) — the host decides what happens
// next: navigate straight into the flow, or capture the intent and ask for
// sign-in first. `target` is the step the choice leads to: entering a URL here
// skips the details step, other types go through it.

// `stacked` keeps the toggle and button on separate rows with a full-width
// button — needed when the card sits in a narrow column (e.g. the hero).
export function UrlQuickStart({ onStart, stacked = false }) {
  const [url, setUrl] = useState('')
  const [dynamic, setDynamic] = useState(true)
  const UrlIcon = findType('url').Icon

  const startUrl = () => {
    if (!url.trim()) return
    onStart('url', { url: url.trim() }, dynamic, '/create/design')
  }

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-line">
      <div className="p-5 flex items-center gap-3 border-b border-line">
        <div className="w-11 h-11 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
          <UrlIcon size={20} />
        </div>
        <div className="min-w-0">
          <div className="font-semibold text-ink">Website URL</div>
          <div className="text-xs text-ink-muted">
            Open a link — the quickest way to start
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-sm text-ink-muted leading-relaxed">
          Scanning this QR will{' '}
          <span className="font-medium text-ink-soft">open your link</span>.
          Paste a URL and continue, or pick another type below.
        </p>

        <div className="mt-4">
          <label
            htmlFor="qs-url"
            className="block text-xs font-medium text-ink-muted mb-1.5"
          >
            Website URL
          </label>
          <div className="relative">
            <input
              id="qs-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') startUrl()
              }}
              placeholder="https://example.com"
              className="h-12 w-full rounded-[10px] border border-line bg-surface px-4 pr-11 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-ink-faint"
            />
            {url.trim() && (
              <Check
                size={18}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary"
              />
            )}
          </div>
        </div>

        <div
          className={
            stacked
              ? 'mt-5 flex flex-col gap-4'
              : 'mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'
          }
        >
          <div className="flex items-center gap-3">
            <Toggle
              checked={dynamic}
              onChange={setDynamic}
              ariaLabel="Dynamic QR — statistics and editability"
            />
            <span
              onClick={() => setDynamic((v) => !v)}
              className="text-sm font-medium text-ink-soft cursor-pointer select-none"
            >
              Dynamic QR{' '}
              <span className="text-ink-faint font-normal">
                (Statistics & Editability)
              </span>
            </span>
            <DynamicQRInfo />
          </div>
          <button
            type="button"
            onClick={startUrl}
            disabled={!url.trim()}
            className={`bg-primary text-white rounded-[10px] h-11 font-semibold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors whitespace-nowrap shadow-sm shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed ${
              stacked ? 'w-full' : 'px-6'
            }`}
          >
            Generate QR <ArrowRight size={17} />
          </button>
        </div>
      </div>
    </div>
  )
}

// `bare` drops the surrounding card + divider heading, for hosts that supply
// their own section framing.
export function QrTypeGrid({ onStart, bare = false }) {
  const grid = (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
      {QR_TYPES.map((t) => {
        const Icon = t.Icon
        return (
          <button
            key={t.key}
            type="button"
            onClick={() =>
              onStart(
                t.key,
                defaultContent(t.key),
                t.dynamicCapable,
                '/create/details',
              )
            }
            className="flex items-center gap-2.5 rounded-[10px] border border-line bg-surface p-3 text-left transition-all hover:border-primary/40 hover:bg-canvas hover:shadow-sm"
          >
            <span
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${t.tint}`}
            >
              <Icon size={17} />
            </span>
            <span className="min-w-0">
              {/* Title wraps rather than truncates — at mobile widths the
                  2-column grid is too narrow for names like "Contact Card". */}
              <span className="block text-[13px] font-semibold text-ink leading-snug">
                {t.label}
              </span>
              <span className="block text-[11px] text-ink-muted truncate">
                {t.subtitle}
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )

  if (bare) return grid

  return (
    <div className="bg-surface rounded-2xl shadow-card border border-line p-5">
      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-xs font-medium text-ink-muted whitespace-nowrap">
          or choose a QR code type
        </span>
        <div className="h-px flex-1 bg-line" />
      </div>
      <div className="mt-4">{grid}</div>
    </div>
  )
}

// Both pieces stacked — the in-app create step.
export default function QrQuickStart({ onStart }) {
  return (
    <div className="space-y-5">
      <UrlQuickStart onStart={onStart} />
      <QrTypeGrid onStart={onStart} />
    </div>
  )
}
