/**
 * Browser-side error reporting, kept off the critical path.
 *
 * Sentry's browser SDK is ~30KB gzipped and its job — telling us about errors
 * after the fact — is never urgent. This page has already been shipped once
 * with a load-time regression that measured fine on a desktop and produced
 * fifteen seconds of unstyled page on a real phone, so nothing new gets to run
 * before first paint.
 *
 * So it is a dynamic import fired when the browser goes idle, behind a check on
 * VITE_SENTRY_DSN. With no DSN the import never happens and the bundle is never
 * fetched: this costs nothing until it is switched on, and when it is, it costs
 * nothing until the page is done.
 *
 * Errors thrown before it loads are not lost — see queueError below.
 */

const DSN = import.meta.env.VITE_SENTRY_DSN

let sentry = null
// Anything that failed before the SDK arrived. Bounded, because a render loop
// throwing every frame must not become the reason the tab runs out of memory.
const pending = []
const MAX_PENDING = 20

/** Report an error, whether or not the SDK has finished loading. */
export function reportError(error, context) {
  if (!DSN) return
  if (sentry) {
    sentry.captureException(error, context ? { extra: context } : undefined)
    return
  }
  if (pending.length < MAX_PENDING) pending.push([error, context])
}

export function initErrorTracking() {
  if (!DSN || typeof window === 'undefined') return

  const start = () =>
    import('@sentry/react')
      .then((mod) => {
        mod.init({
          dsn: DSN,
          environment: import.meta.env.MODE,
          // Errors only. Tracing is the expensive half and nothing here needs it.
          tracesSampleRate: 0,
          // A QR code's content is the user's own data — a destination URL, a
          // phone number, a Wi-Fi password. None of it belongs in an error
          // report, so send no request bodies and no identifiers.
          sendDefaultPii: false,
        })
        sentry = mod
        for (const [error, context] of pending.splice(0)) {
          mod.captureException(error, context ? { extra: context } : undefined)
        }
      })
      .catch(() => {
        // Reporting that reporting failed is not worth a broken page.
      })

  const idle = window.requestIdleCallback || ((fn) => setTimeout(fn, 3000))
  idle(start)
}
