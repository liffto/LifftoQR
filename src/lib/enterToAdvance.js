// Enter moves to the next field instead of doing nothing.
//
// The app has no <form> elements anywhere — every screen is divs with onClick
// buttons — so there is no native submit-on-Enter and no native field order to
// inherit. This supplies both, scoped to whichever container the handler is
// attached to. Attach it once per form; keydown bubbles, so it sees every
// field underneath it, including ones nested in child components.

// The types you actually type into. Checkboxes, radios, ranges, colour
// swatches and file pickers are all still reachable by Tab, but none of them
// is a sensible landing spot for someone who just finished typing a value.
const TYPED_INPUT = new Set([
  'text',
  'search',
  'url',
  'tel',
  'email',
  'password',
  'number',
  'date',
  'datetime-local',
  'month',
  'week',
  'time',
])

function isTypedField(el) {
  if (el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') return true
  return el.tagName === 'INPUT' && TYPED_INPUT.has(el.type)
}

function isReachable(el) {
  if (el.disabled || el.readOnly) return false
  if (el.tabIndex < 0) return false
  if (el.hidden || el.type === 'hidden') return false

  const style = getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden') return false

  // The check above only sees the element's own style, so it misses a field
  // sitting inside a collapsed accordion. A null offsetParent catches those —
  // but it is also null for position:fixed elements, which are visible, and
  // null for *everything* under jsdom, which computes no layout at all.
  // Consulting it only when the document has real layout keeps this usable
  // both in the browser and in tests.
  if (document.body.offsetWidth > 0 && el.offsetParent === null) {
    return style.position === 'fixed'
  }
  return true
}

/**
 * Container-level onKeyDown. Moves focus to the next typed field on Enter.
 *
 * @param {KeyboardEvent} event   the React keydown event
 * @param {{onLast?: () => void}} [options]
 *   onLast runs when Enter is pressed in the final field, for wiring Enter to
 *   a form's primary action. The field is blurred either way so the mobile
 *   keyboard drops.
 */
export function advanceOnEnter(event, { onLast } = {}) {
  if (event.key !== 'Enter') return
  // A handler closer to the input already dealt with it.
  if (event.defaultPrevented) return
  // Leave modified combos alone — Shift+Enter in particular.
  if (event.shiftKey || event.ctrlKey || event.metaKey || event.altKey) return

  const el = event.target
  // A textarea needs Enter for newlines. It is a fine destination, never a
  // source; advancing out of one would make multi-line fields unfillable.
  if (el.tagName === 'TEXTAREA') return
  if (!isTypedField(el) || !isReachable(el)) return

  const fields = Array.from(
    event.currentTarget.querySelectorAll('input, select, textarea'),
  ).filter((f) => isTypedField(f) && isReachable(f))

  const index = fields.indexOf(el)
  if (index === -1) return

  event.preventDefault()

  const next = fields[index + 1]
  if (!next) {
    el.blur()
    onLast?.()
    return
  }

  next.focus()
  // Match what Tab does — select what is already there so typing replaces it.
  try {
    next.select?.()
  } catch {
    // Not every input type supports a text selection; focus alone is enough.
  }
}
