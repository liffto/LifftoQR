import { Check } from 'lucide-react'

// Brand toggle switch.
export function Toggle({ checked, onChange, id }) {
  return (
    <button
      type="button"
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ${
        checked ? 'bg-primary' : 'bg-gray-300'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

// Color swatch + hex field, matching the design's "#000000" pills.
export function ColorField({ value, onChange, className = '' }) {
  return (
    <label
      className={`flex items-center gap-2 rounded-[10px] bg-canvas px-2.5 py-2.5 ${className}`}
    >
      <span
        className="relative h-7 w-7 shrink-0 overflow-hidden rounded-[10px] ring-1 ring-black/10"
        style={{ background: value }}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        />
      </span>
      <input
        type="text"
        value={value.toUpperCase()}
        onChange={(e) => {
          const v = e.target.value
          if (/^#[0-9a-fA-F]{0,6}$/.test(v)) onChange(v)
        }}
        className="w-full bg-transparent text-sm font-medium text-ink outline-none"
      />
    </label>
  )
}

// Square checkbox used by "Save Template when Finished".
export function Checkbox({ checked, onChange, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex items-center gap-3 text-left"
    >
      <span
        className={`flex h-5 w-5 items-center justify-center rounded-[10px] border transition-colors ${
          checked ? 'border-primary bg-primary' : 'border-gray-300 bg-white'
        }`}
      >
        {checked && <Check size={14} strokeWidth={3} className="text-white" />}
      </span>
      {label && <span className="text-sm text-ink-soft">{label}</span>}
    </button>
  )
}

export function Spinner({ size = 18 }) {
  return (
    <span
      className="inline-block animate-spin rounded-full border-2 border-white border-t-transparent"
      style={{ width: size, height: size }}
    />
  )
}

export function SectionHeader({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-start gap-3">
      <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-canvas text-ink-muted">
        {Icon && <Icon size={18} />}
      </span>
      <div>
        <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
        {desc && <p className="mt-0.5 text-xs text-ink-muted">{desc}</p>}
      </div>
    </div>
  )
}
