import { useEffect, useRef, useState } from 'react'

// Defers mounting an expensive child until its wrapper scrolls near the
// viewport, so a long page doesn't force everything on it to render in one
// burst on initial load. Built for QRView: each instance runs a third-party
// library's SVG generation synchronously on mount, and this page alone asks
// for 21 of them. On a fast desktop that burst is invisible; on a throttled
// in-app browser (WhatsApp's, confirmed by a user screenshot) it was
// producing dropped renders and a real, multi-second stall before anything
// past the hero appeared — most of that work was for QR codes nobody had
// scrolled to yet.
//
// width/height reserve the child's footprint up front so nothing shifts into
// place once it mounts — matched to whatever size prop the wrapped QRView
// already uses, so the wrapper adds no layout of its own.
//
// Renders immediately, skipping the observer, only when deferring genuinely
// can't help: IntersectionObserver unavailable, or the wrapper somehow has no
// DOM node to observe.
export default function LazyMount({
  children,
  width,
  height,
  rootMargin = '600px 0px',
}) {
  const ref = useRef(null)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || typeof IntersectionObserver === 'undefined') {
      setShow(true)
      return undefined
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          // Not just entry.isIntersecting: a fast or programmatic scroll can
          // jump straight past a target between two observer checks, and the
          // callback then reports only the "no longer intersecting" side of
          // that transition — never a true hit, so the QR would stay an
          // empty placeholder forever even though the visit is well past it.
          // rootBounds.bottom is the reach of the expanded root; a target
          // whose top is already above that line has either entered it or
          // been skipped over — both mean waiting no longer helps. Elements
          // still genuinely far below (top beyond the reach) correctly fall
          // through and keep waiting.
          const reached = entry.rootBounds
            ? entry.boundingClientRect.top < entry.rootBounds.bottom
            : entry.isIntersecting
          if (reached) {
            setShow(true)
            io.disconnect()
          }
        })
      },
      { rootMargin },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [rootMargin])

  return (
    <div ref={ref} className="inline-flex shrink-0" style={{ width, height }}>
      {show ? children : null}
    </div>
  )
}
