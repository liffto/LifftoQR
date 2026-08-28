import { useEffect, useRef, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { SELECTABLE_QR_TYPES, findType } from '../lib/qrTypes'

// A type chooser for the hero.
//
// The hero used to say "Paste URL" and nothing else, so a first-time visitor
// had no way to learn the other types exist without scrolling to the
// grid further down the page. This puts that fact in the highest-attention
// spot on the site.
//
// Deliberately not a native <select>: a closed select shows only the current
// value, which is the one thing the visitor already knows. The trigger here
// carries the type count so the breadth registers even if it is never opened,
// and opening reveals icons rather than a list of words.

export default function QrTypePicker({ value = 'url', onSelect, labelId }) {
  const [open, setOpen] = useState(false)
  // Which option the arrow keys are sitting on, as an index into the list.
  const [cursor, setCursor] = useState(0)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)
  const optionRefs = useRef([])

  const active = findType(value)
  const ActiveIcon = active.Icon

  const close = ({ refocus = true } = {}) => {
    setOpen(false)
    if (refocus) triggerRef.current?.focus()
  }

  const openList = () => {
    const i = Math.max(
      0,
      SELECTABLE_QR_TYPES.findIndex((t) => t.key === value),
    )
    setCursor(i)
    setOpen(true)
  }

  // Move focus onto the cursor option so screen readers announce it and the
  // keyboard stays inside the list.
  useEffect(() => {
    if (open) optionRefs.current[cursor]?.focus()
  }, [open, cursor])

  // Clicking anywhere else dismisses. Pointerdown rather than click so the
  // list closes before the click lands on whatever is underneath.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  const choose = (key) => {
    setOpen(false)
    onSelect?.(key)
  }

  const onListKeyDown = (e) => {
    const last = SELECTABLE_QR_TYPES.length - 1
    switch (e.key) {
      case 'Escape':
        e.preventDefault()
        close()
        break
      case 'ArrowDown':
        e.preventDefault()
        setCursor((c) => (c >= last ? 0 : c + 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setCursor((c) => (c <= 0 ? last : c - 1))
        break
      case 'Home':
        e.preventDefault()
        setCursor(0)
        break
      case 'End':
        e.preventDefault()
        setCursor(last)
        break
      case 'Tab':
        // Tabbing out of a popover should dismiss it, not leave it hanging.
        setOpen(false)
        break
      default:
        break
    }
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => (open ? close() : openList())}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            openList()
          }
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelId}
        className={`flex h-12 w-full items-center gap-3 rounded-[10px] border bg-surface px-3 text-left transition ${
          open
            ? 'border-primary ring-2 ring-primary/10'
            : 'border-line hover:border-primary/40'
        }`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${active.tint}`}
        >
          <ActiveIcon size={16} />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium text-ink">
          {active.label}
        </span>
        {/* The count is the whole point of the control — visible without a click. */}
        <span className="shrink-0 text-[11px] font-medium text-ink-faint">
          {SELECTABLE_QR_TYPES.length} types
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-ink-faint transition-transform ${open ? 'rotate-180' : ''}`}
        />
      </button>

      {open && (
        <div
          role="listbox"
          aria-labelledby={labelId}
          onKeyDown={onListKeyDown}
          className="absolute left-0 right-0 top-[calc(100%+6px)] z-30 max-h-[340px] overflow-y-auto overscroll-contain rounded-[12px] border border-line bg-surface p-2 shadow-panel"
        >
          {/* One column until there is room for two. At 375px a two-up grid
              leaves ~82px for the label, and "Google Review" needs ~92 — a
              truncated type name defeats the point of showing the list. */}
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {SELECTABLE_QR_TYPES.map((t, i) => {
              const Icon = t.Icon
              const selected = t.key === value
              return (
                <button
                  key={t.key}
                  ref={(el) => (optionRefs.current[i] = el)}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  tabIndex={i === cursor ? 0 : -1}
                  onClick={() => choose(t.key)}
                  onMouseEnter={() => setCursor(i)}
                  className={`flex items-center gap-2.5 rounded-[10px] border p-2.5 text-left outline-none transition ${
                    selected
                      ? 'border-primary bg-primary/[0.04]'
                      : 'border-transparent hover:border-line'
                  } focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/15`}
                >
                  <span
                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] ${t.tint}`}
                  >
                    <Icon size={16} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-semibold text-ink">
                      {t.label}
                    </span>
                    <span className="block truncate text-[11px] text-ink-faint">
                      {t.subtitle}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
