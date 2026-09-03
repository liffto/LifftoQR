/**
 * The thing you see when you pull the dashboard down: a QR code that draws
 * itself in as you pull, then gets scanned while the list reloads.
 *
 * A generic spinner would have done, but this is a QR app and the gesture is
 * about the codes — so the indicator is one being built. Pulling reveals it
 * from the bottom up, which gives the pull somewhere to go and makes the
 * threshold visible: when the code is whole, letting go will refresh.
 *
 * The reveal is a single mask rectangle driven by one CSS variable rather than
 * per-module opacity. That is one style write per frame instead of forty, and
 * it is the reason this stays smooth on the mid-range phone that matters here.
 */

// An 11x11 grid. The three 3x3 finders sit in the corners a real QR uses, and
// the modules fill around them — enough to read as a QR at 36px without being
// a real encoding. Generating a genuine one would mean loading the QR library
// for a spinner.
const FINDERS = [
  [0, 0],
  [8, 0],
  [0, 8],
]

const MODULES = [
  [4, 0], [6, 0], [4, 1], [5, 1], [7, 1], [4, 2], [6, 2],
  [0, 4], [1, 4], [3, 4], [5, 4], [6, 4], [8, 4], [10, 4],
  [1, 5], [2, 5], [4, 5], [7, 5], [9, 5],
  [0, 6], [3, 6], [5, 6], [6, 6], [8, 6], [10, 6],
  [2, 7], [4, 7], [7, 7], [9, 7], [10, 7],
  [4, 8], [6, 8], [9, 8],
  [5, 9], [7, 9], [8, 9], [10, 9],
  [4, 10], [6, 10], [9, 10],
]

// The three big squares every QR has — what makes the shape read as a QR at
// this size, so they are drawn rather than left to the scatter.
function Finder({ x, y }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width="3" height="3" rx="0.7" className="fill-current" />
      <rect x="0.62" y="0.62" width="1.76" height="1.76" rx="0.4" className="fill-surface" />
      <rect x="1.05" y="1.05" width="0.9" height="0.9" rx="0.25" className="fill-current" />
    </g>
  )
}

/**
 * @param progress   0..1, how far the pull has got
 * @param refreshing true once the request is in flight
 */
export default function QrRefreshIndicator({ progress = 0, refreshing = false }) {
  // Never fully empty: the first pixel of pull should already show something,
  // or the gesture feels like it did nothing.
  const revealed = refreshing ? 1 : 0.14 + progress * 0.86

  return (
    <span
      className={`qr-refresh block h-9 w-9 text-ink ${refreshing ? 'is-refreshing' : ''}`}
      style={{ '--qr-reveal': revealed }}
      role="status"
      aria-label={refreshing ? 'Refreshing your codes' : 'Pull to refresh'}
    >
      <svg viewBox="-0.4 -0.4 11.8 11.8" className="h-full w-full" aria-hidden>
        <defs>
          {/* Unique per instance is unnecessary — only one of these is ever on
              screen — but the id is scoped enough not to collide with the real
              QR renderer's defs. */}
          <mask id="qr-refresh-reveal" maskUnits="userSpaceOnUse">
            <rect
              className="qr-reveal-rect"
              x="-1"
              y="-1"
              width="14"
              height="14"
              fill="white"
            />
          </mask>
        </defs>
        <g mask="url(#qr-refresh-reveal)">
          {FINDERS.map(([x, y]) => (
            <Finder key={`f-${x}-${y}`} x={x} y={y} />
          ))}
          {MODULES.map(([x, y]) => (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width="0.82"
              height="0.82"
              rx="0.18"
              className="fill-current"
            />
          ))}
        </g>
        {/* Only while something is genuinely loading, so it never implies work
            that is not happening. */}
        {refreshing && (
          <rect
            className="qr-scanline"
            x="-0.4"
            width="11.8"
            height="0.5"
            rx="0.25"
            fill="currentColor"
          />
        )}
      </svg>
    </span>
  )
}
