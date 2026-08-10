import { useState } from 'react'
import { defaultDesign } from '../lib/store'
import QRView from './QRView'

// The "Make it yours" step, made playable: tap a style or a colour and the code
// above restyles instantly. Swatches are rendered at 36px — below roughly 30px
// qr-code-styling's modules collapse and the thumbnail reads blank.

const STYLE_PRESETS = [
  {
    key: 'violet',
    label: 'Violet fade',
    design: {
      bodyPattern: 'extra-rounded',
      cornerStyle: 4,
      bodyGradient: true,
      bodyColor2: '#1B59F5',
      logo: 'company',
    },
  },
  {
    key: 'dots',
    label: 'Dots',
    design: { bodyPattern: 'dots', cornerStyle: 3 },
  },
  {
    key: 'classic',
    label: 'Classic squares',
    design: { bodyPattern: 'square', cornerStyle: 0 },
  },
]

const COLOURS = [
  { key: 'blue', value: '#1B59F5' },
  { key: 'teal', value: '#16A394' },
  { key: 'violet', value: '#7C3AED' },
]

export default function StepStyleDemo() {
  const [styleIdx, setStyleIdx] = useState(0)
  const [colour, setColour] = useState(COLOURS[2].value)

  const preset = STYLE_PRESETS[styleIdx]
  const record = {
    typeKey: 'url',
    dynamic: false,
    content: { url: 'https://liffto.com' },
    url: 'https://liffto.com',
    design: {
      ...defaultDesign(),
      ...preset.design,
      bodyColor1: colour,
      cornerColor1: colour,
    },
  }

  const swatchRecord = (p) => ({
    typeKey: 'url',
    dynamic: false,
    content: { url: 'https://liffto.com' },
    url: 'https://liffto.com',
    design: {
      ...defaultDesign(),
      ...p.design,
      bodyColor1: colour,
      cornerColor1: colour,
    },
  })

  return (
    <div className="w-full">
      <div className="flex justify-center">
        <div className="rounded-[14px] bg-white p-3 shadow-card ring-1 ring-black/[0.04]">
          <QRView record={record} size={92} />
        </div>
      </div>

      <div className="mt-4 flex items-center justify-center gap-2">
        {STYLE_PRESETS.map((p, i) => {
          const active = i === styleIdx
          return (
            <button
              key={p.key}
              type="button"
              onClick={() => setStyleIdx(i)}
              aria-pressed={active}
              title={p.label}
              className={`h-11 w-11 rounded-[10px] bg-white flex items-center justify-center transition-all ${
                active
                  ? 'ring-2 ring-primary'
                  : 'ring-1 ring-line hover:ring-primary/40'
              }`}
            >
              <QRView record={swatchRecord(p)} size={36} />
              <span className="sr-only">{p.label}</span>
            </button>
          )
        })}

        <span aria-hidden className="mx-1 h-6 w-px bg-line" />

        {COLOURS.map((c) => {
          const active = c.value === colour
          return (
            <button
              key={c.key}
              type="button"
              onClick={() => setColour(c.value)}
              aria-pressed={active}
              aria-label={`Use ${c.key}`}
              title={c.key}
              className={`h-6 w-6 rounded-full transition-all ${
                active
                  ? 'ring-2 ring-offset-2 ring-primary ring-offset-canvas scale-110'
                  : 'ring-1 ring-black/10 hover:scale-105'
              }`}
              style={{ backgroundColor: c.value }}
            />
          )
        })}
      </div>

      <p className="mt-3 text-center text-[10.5px] font-medium text-ink-faint">
        Go on — tap a style
      </p>
    </div>
  )
}
