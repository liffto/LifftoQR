import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { defaultDesign } from '../lib/store'
import { defaultContent, findType } from '../lib/qrTypes'
import { Toggle } from './ui'
import QRView from './QRView'
import QrTypePicker from './QrTypePicker'
import DynamicQRInfo from './DynamicQRInfo'

// The hero's live preview. Paste a link and the plain, default code renders
// immediately. The style strip below cycles every couple of seconds and the
// preview follows it, so the studio advertises itself — but a click takes over
// and stops the cycle, because an explicit choice should always win.
//
// Handing off: an untouched strip continues with the DEFAULT design (step three
// opens on a clean slate); a style the visitor actually picked is carried through.

const STYLES = [
  { key: 'default', label: 'Default', design: {} },
  {
    key: 'branded',
    label: 'Branded gradient',
    design: {
      bodyPattern: 'classy-rounded',
      cornerStyle: 8,
      bodyGradient: true,
      bodyColor1: '#1B59F5',
      bodyColor2: '#16C2C8',
      cornerColor1: '#1B59F5',
      logo: 'company',
    },
  },
  {
    key: 'rounded',
    label: 'Rounded ink',
    design: {
      bodyPattern: 'rounded',
      cornerStyle: 4,
      bodyColor1: '#1F2430',
      cornerColor1: '#1B59F5',
    },
  },
  {
    key: 'dots',
    label: 'Dots',
    design: {
      bodyPattern: 'dots',
      cornerStyle: 3,
      bodyColor1: '#1B59F5',
      cornerColor1: '#1F2430',
    },
  },
  {
    key: 'violet',
    label: 'Violet fade',
    design: {
      bodyPattern: 'extra-rounded',
      cornerStyle: 4,
      bodyGradient: true,
      bodyColor1: '#7C3AED',
      bodyColor2: '#1B59F5',
      cornerColor1: '#1B59F5',
      logo: 'instagram',
    },
  },
]

const SWATCH_URL = 'https://liffto.com'
const CYCLE_MS = 2000

// Built once. Rebuilding these per render gave every swatch a new record object,
// which invalidated QRView's config on each 2s cycle tick and left some
// thumbnails blank mid-redraw.
const SWATCH_RECORDS = STYLES.map((s) => ({
  typeKey: 'url',
  content: { url: SWATCH_URL },
  url: SWATCH_URL,
  dynamic: false,
  design: { ...defaultDesign(), ...s.design },
}))

export default function HeroQrStudio({ onStart }) {
  const [url, setUrl] = useState('')
  const [dynamic, setDynamic] = useState(true)
  const [featured, setFeatured] = useState(0)
  // null until the visitor picks a style themselves.
  const [picked, setPicked] = useState(null)
  const [hint, setHint] = useState(false)
  const inputRef = useRef(null)

  const value = url.trim()
  const activeIdx = picked ?? featured
  const activeStyle = STYLES[activeIdx] || STYLES[0]
  // With no link yet we show a labelled sample rather than an empty box — the
  // hero's focal object should never be a void. It's replaced the moment they type.
  const isSample = !value

  // Cycle the showcase until the visitor takes over. Paused for reduced motion.
  useEffect(() => {
    if (picked !== null) return undefined
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduced) return undefined
    const id = setInterval(
      () => setFeatured((f) => (f + 1) % STYLES.length),
      CYCLE_MS,
    )
    return () => clearInterval(id)
  }, [picked])

  // Always a real code: theirs once they type, a sample until then. Either way it
  // wears the style currently showing, so the strip visibly does something.
  const preview = useMemo(() => {
    const link = value || SWATCH_URL
    return {
      typeKey: 'url',
      type: 'Website URL',
      content: { url: link },
      url: link,
      dynamic: false,
      qrType: 'Static QR',
      design: { ...defaultDesign(), ...activeStyle.design },
    }
  }, [value, activeStyle])

  // URL is what the hero already does inline, so choosing it just returns the
  // visitor to the field. Every other type needs fields the hero has no room
  // for, so it hands off to the guided form — through sign-in when needed,
  // which is what onStart already arranges.
  const pickType = (key) => {
    if (key === 'url') {
      inputRef.current?.focus()
      return
    }
    const t = findType(key)
    onStart(key, defaultContent(key), t.dynamicCapable, '/create/details')
  }

  const start = () => {
    // The primary action is never disabled — an empty field asks for the link
    // instead of presenting a dead button.
    if (!value) {
      setHint(true)
      inputRef.current?.focus()
      return
    }
    // Untouched showcase hands off the default look; an explicit pick is kept.
    const design = picked !== null ? STYLES[picked].design : undefined
    onStart('url', { url: value }, dynamic, '/create/design', design)
  }

  return (
    <div className="rounded-2xl bg-surface border border-line shadow-panel overflow-hidden">
      {/* Live output — a real code either way, badged while it's a sample */}
      <div className="bg-canvas px-6 pt-7 pb-6 border-b border-line">
        <div className="flex justify-center">
          <div className="relative">
            <div className="rounded-2xl bg-white p-4 shadow-card border border-line/60">
              <QRView record={preview} size={188} />
            </div>
            {isSample && (
              <span className="absolute -top-2 left-1/2 -translate-x-1/2 rounded-full bg-ink px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white shadow-sm">
                Sample
              </span>
            )}
          </div>
        </div>
        <p className="mt-4 text-center text-[12px] text-ink-muted">
          {isSample
            ? 'A sample code — paste your link to make it yours'
            : 'Point your camera at it — this code is live'}
        </p>
      </div>

      <div className="p-6">
        {/* Type first: the hero's job is partly to show this is not just a
            link shortener. Picking anything other than a URL hands straight
            off to that type's guided form. */}
        <p
          id="hero-type-label"
          className="block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint"
        >
          QR code type
        </p>
        <div className="mt-2">
          <QrTypePicker
            value="url"
            labelId="hero-type-label"
            onSelect={pickType}
          />
        </div>

        {/* The visitor's link comes first */}
        <label
          htmlFor="hero-url"
          className="mt-6 block text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint"
        >
          Paste URL
        </label>
        <div className="relative mt-2">
          <input
            id="hero-url"
            ref={inputRef}
            value={url}
            onChange={(e) => {
              setUrl(e.target.value)
              if (hint) setHint(false)
            }}
            aria-describedby={hint ? 'hero-url-hint' : undefined}
            onKeyDown={(e) => {
              if (e.key === 'Enter') start()
            }}
            placeholder="https://example.com"
            className="h-12 w-full rounded-[10px] border border-line bg-surface px-4 pr-11 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-ink-faint"
          />
          {value && (
            <Check
              size={18}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-success"
            />
          )}
        </div>
        {hint && (
          <p
            id="hero-url-hint"
            role="alert"
            className="mt-2 text-[12px] font-medium text-danger"
          >
            Paste a link first — then we&apos;ll build your code.
          </p>
        )}

        {/* Style — cycles on its own, and clicking takes over */}
        <div className="mt-6 flex items-baseline justify-between gap-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-ink-faint">
            Style
          </p>
          <p className="text-[11px] text-ink-faint">
            {picked !== null ? activeStyle.label : 'Tap one to keep it'}
          </p>
        </div>
        <div className="mt-3 flex items-center gap-2.5">
          {STYLES.map((s, i) => {
            const active = i === activeIdx
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setPicked(i)}
                aria-pressed={active}
                title={s.label}
                className={`h-[54px] w-[54px] shrink-0 rounded-[12px] bg-white flex items-center justify-center transition-all duration-300 ${
                  active
                    ? 'ring-2 ring-primary border border-primary scale-105'
                    : 'border border-line opacity-70 hover:opacity-100 hover:border-primary/40'
                }`}
              >
                <QRView record={SWATCH_RECORDS[i]} size={38} />
                <span className="sr-only">{s.label}</span>
              </button>
            )
          })}
        </div>

        <div className="mt-6 flex items-center gap-3">
          <Toggle
            checked={dynamic}
            onChange={setDynamic}
            ariaLabel="Keep this code editable after printing"
          />
          <span
            onClick={() => setDynamic((v) => !v)}
            className="text-[13px] font-medium text-ink-soft cursor-pointer select-none leading-snug"
          >
            Keep it editable after printing
          </span>
          <DynamicQRInfo />
        </div>

        <button
          type="button"
          onClick={start}
          className="mt-5 w-full h-[52px] rounded-[10px] bg-primary text-white font-semibold flex items-center justify-center gap-2.5 hover:bg-primary-600 transition-colors shadow-sm shadow-primary/25"
        >
          Customise &amp; download <ArrowRight size={18} />
        </button>
        <p className="mt-3 text-center text-[11px] text-ink-faint leading-relaxed">
          Sign in with Google to save it — free, no card needed.
        </p>
      </div>
    </div>
  )
}
