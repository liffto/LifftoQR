import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Pull down at the top of the page to reload the list.
 *
 * Touch only, and only from a genuine downward drag that starts with the page
 * already at the top — otherwise this would fight ordinary scrolling, which is
 * the thing people are actually doing 99% of the time.
 *
 * The pull is resisted rather than tracked one-to-one: the indicator moves
 * about a third as far as the finger, so it feels attached to something and
 * cannot be flung halfway down the screen. Past the threshold it stops moving
 * altogether and waits, which is the signal that letting go will do something.
 */

// How far past the top you have to drag before releasing refreshes.
const THRESHOLD = 64
// Ignore the first few pixels so a slightly-off-vertical tap or a fast upward
// flick never reads as a pull.
const SLOP = 8
const RESISTANCE = 0.4
const MAX_PULL = 96

export function usePullToRefresh(onRefresh, { enabled = true } = {}) {
  const [pull, setPull] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  // Refs, not state: these change on every touchmove and none of them should
  // cost a render.
  const startY = useRef(0)
  const active = useRef(false)
  const armed = useRef(false)
  const frame = useRef(0)
  const refreshingRef = useRef(false)
  // Mirrors `pull` so the touchend handler can read the current distance
  // without a functional setState. Deciding inside an updater would put a side
  // effect somewhere React is free to call twice — under StrictMode it does,
  // and the refresh fired twice per pull.
  const pullRef = useRef(0)
  // The callback is read through a ref so the listeners register once and stay
  // registered. react-query's refetch is not referentially stable, and this
  // dashboard re-renders often — depending on it directly tore the touch
  // listeners down and rebuilt them mid-gesture, which silently killed every
  // pull that spanned a render.
  const onRefreshRef = useRef(onRefresh)

  const applyPull = useCallback((value) => {
    pullRef.current = value
    setPull(value)
  }, [])

  useEffect(() => {
    onRefreshRef.current = onRefresh
  }, [onRefresh])

  const finish = useCallback(() => {
    refreshingRef.current = false
    setRefreshing(false)
    applyPull(0)
  }, [applyPull])

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return
    // A mouse has a scrollbar and a reload button; this is for thumbs.
    if (!window.matchMedia?.('(hover: none) and (pointer: coarse)').matches) return

    const atTop = () => (window.scrollY || document.documentElement.scrollTop) <= 0

    const onStart = (e) => {
      if (refreshingRef.current || e.touches.length !== 1 || !atTop()) return
      startY.current = e.touches[0].clientY
      armed.current = true
      active.current = false
    }

    const onMove = (e) => {
      if (!armed.current || refreshingRef.current) return
      const delta = e.touches[0].clientY - startY.current

      // Pulling upward, or the page has scrolled away from the top: this is a
      // scroll. Stand down for the rest of the gesture.
      if (delta < -SLOP || !atTop()) {
        armed.current = false
        if (active.current) {
          active.current = false
          applyPull(0)
        }
        return
      }

      // Downward but not yet past the slop. Stay armed and wait — every real
      // pull passes through a few pixels on its way, and disarming here would
      // kill the gesture on its first frame.
      if (delta <= SLOP) return

      active.current = true
      // Non-passive listener, so this actually suppresses the native scroll and
      // the rubber-band underneath the pull.
      if (e.cancelable) e.preventDefault()

      const next = Math.min(MAX_PULL, (delta - SLOP) * RESISTANCE)
      cancelAnimationFrame(frame.current)
      frame.current = requestAnimationFrame(() => applyPull(next))
    }

    const onEnd = () => {
      cancelAnimationFrame(frame.current)
      const wasActive = active.current
      armed.current = false
      active.current = false
      if (!wasActive) return

      if (pullRef.current < THRESHOLD || refreshingRef.current) {
        applyPull(0)
        return
      }

      refreshingRef.current = true
      setRefreshing(true)
      // Held open at the threshold for as long as the request takes, rather
      // than for a guessed duration.
      applyPull(THRESHOLD)
      // Called straight away rather than through Promise.resolve().then, which
      // would hold the request back by a microtask for no reason. The async
      // wrapper still catches a synchronous throw.
      ;(async () => {
        try {
          await onRefreshRef.current()
        } catch {
          // A refresh that fails still has to let go of the spinner, or one
          // network blip leaves the page looking busy forever.
        } finally {
          finish()
        }
      })()
    }

    window.addEventListener('touchstart', onStart, { passive: true })
    window.addEventListener('touchmove', onMove, { passive: false })
    window.addEventListener('touchend', onEnd, { passive: true })
    window.addEventListener('touchcancel', onEnd, { passive: true })
    return () => {
      cancelAnimationFrame(frame.current)
      window.removeEventListener('touchstart', onStart)
      window.removeEventListener('touchmove', onMove)
      window.removeEventListener('touchend', onEnd)
      window.removeEventListener('touchcancel', onEnd)
    }
  }, [enabled, finish, applyPull])

  return {
    pull,
    refreshing,
    /** 0..1 — how much of the QR has drawn in. */
    progress: Math.min(1, pull / THRESHOLD),
    ready: pull >= THRESHOLD,
  }
}

export default usePullToRefresh
