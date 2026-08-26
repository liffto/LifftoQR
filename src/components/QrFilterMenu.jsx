import { useEffect, useRef, useState } from 'react'
import { SlidersHorizontal, Check } from 'lucide-react'
import {
  TYPE_FILTERS,
  STATUS_FILTERS,
  filtersContradict,
} from '../lib/dashboardFilters'

// The dashboard's type and status filters, behind one control in the search
// field.
//
// These were six pills across two rows, permanently occupying the top of the
// list to serve an occasional decision. Folding them away costs the one thing
// pills were good at — you could see at a glance what was applied — so the
// trigger carries that instead: it takes on the accent colour and shows a dot
// whenever anything is set, and the count under the list names the filters in
// words. Someone who forgets why their list looks short can find out without
// opening this.

const GROUPS = [
  { key: 'type', label: 'Type', options: TYPE_FILTERS },
  { key: 'status', label: 'Status', options: STATUS_FILTERS },
]

export default function QrFilterMenu({
  type,
  status,
  onChangeType,
  onChangeStatus,
  onClear,
}) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const triggerRef = useRef(null)

  const active = (type !== 'All' ? 1 : 0) + (status !== 'Any status' ? 1 : 0)
  const contradicts = filtersContradict({ type, status })

  // Clicking anywhere else dismisses. Pointerdown rather than click so the menu
  // closes before the click lands on whatever is underneath.
  useEffect(() => {
    if (!open) return undefined
    const onPointerDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  // Escape closes and hands focus back, so the keyboard is never left inside a
  // panel that is no longer on screen.
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      triggerRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  const choose = (groupKey, value) => {
    if (groupKey === 'type') onChangeType(value)
    else onChangeStatus(value)
  }

  const valueFor = (groupKey) => (groupKey === 'type' ? type : status)

  return (
    <div ref={rootRef} className="contents">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={
          active
            ? `Filters, ${active} applied. ${type}, ${status}`
            : 'Filters'
        }
        title="Filters"
        className={`absolute right-1.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-[8px] transition-colors ${
          active || open
            ? 'bg-primary/10 text-primary'
            : 'text-ink-faint hover:bg-line/60 hover:text-ink'
        }`}
      >
        <SlidersHorizontal size={15} />
        {/* The one thing the pills did better. Without it a filtered list looks
            like a list with things missing. */}
        {active > 0 && (
          <span
            className="absolute -right-0.5 -top-0.5 h-2 w-2 rounded-full bg-primary ring-2 ring-canvas"
            aria-hidden="true"
          />
        )}
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Filter QR codes"
          className="absolute right-0 top-full z-30 mt-2 w-60 rounded-[12px] border border-line bg-white py-1.5 shadow-pop"
        >
          {GROUPS.map((group) => (
            <div key={group.key} className="py-1">
              <p
                id={`filter-${group.key}`}
                className="px-3.5 pb-1 pt-1 text-[10px] font-bold uppercase tracking-[0.12em] text-ink-faint"
              >
                {group.label}
              </p>
              <div role="radiogroup" aria-labelledby={`filter-${group.key}`}>
                {group.options.map((option) => {
                  const selected = valueFor(group.key) === option
                  return (
                    <button
                      key={option}
                      type="button"
                      role="radio"
                      aria-checked={selected}
                      onClick={() => choose(group.key, option)}
                      // h-11 rather than something tighter: this is tapped on a
                      // phone, and a 44px row is the smallest that is reliably
                      // hit without aiming.
                      className={`flex h-11 w-full items-center gap-2.5 px-3.5 text-left text-sm transition-colors hover:bg-canvas ${
                        selected ? 'font-semibold text-primary' : 'text-ink'
                      }`}
                    >
                      <Check
                        size={15}
                        className={`shrink-0 ${selected ? 'opacity-100' : 'opacity-0'}`}
                      />
                      <span className="truncate">{option}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          {/* Said here, before the list comes back empty and leaves someone
              wondering which of the two choices was wrong. */}
          {contradicts && (
            <p className="mx-3.5 my-1 rounded-[8px] bg-amber-50 px-2.5 py-2 text-[11.5px] leading-relaxed text-amber-800">
              Static codes have no redirect to switch on or off, so this pair
              matches nothing.
            </p>
          )}

          {active > 0 && (
            <>
              <div className="my-1 h-px bg-line" />
              <button
                type="button"
                onClick={() => {
                  onClear()
                  setOpen(false)
                  triggerRef.current?.focus()
                }}
                className="flex h-10 w-full items-center px-3.5 text-left text-sm font-semibold text-ink-muted transition-colors hover:bg-canvas hover:text-ink"
              >
                Clear filters
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
