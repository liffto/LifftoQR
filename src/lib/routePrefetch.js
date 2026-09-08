// Warming the signed-in route chunks before they are navigated to.
//
// Every signed-in page is a lazy chunk (see App.jsx), and each carries its own
// Layout, so the first navigation to one shows the Suspense fallback across the
// whole screen — sidebar included — for the length of the fetch. That is the
// white flash right after login and the jump on the first click of each nav
// icon. Prefetching turns those first navigations instant.
//
// The loaders live here, imported by App for its lazy() definitions and called
// directly here for prefetch — import() is cached, so prefetching then routing
// is one network fetch, not two. Kept out of App.jsx to avoid a Layout → App
// import cycle.
//
// Never prefetched for a logged-out visitor: the whole reason these are split
// out is that a landing-only visitor should not download the dashboard before
// the landing page paints. Callers gate on being signed in.

export const loadDashboard = () => import('../pages/Dashboard')
export const loadCreateUrl = () => import('../pages/CreateUrl')
export const loadCreateDetails = () => import('../pages/CreateDetails')
export const loadDesignQR = () => import('../pages/DesignQR')
export const loadPayment = () => import('../pages/Payment')
export const loadIntegration = () => import('../pages/Integration')
export const loadFAQ = () => import('../pages/FAQ')
export const loadUserAccount = () => import('../pages/UserAccount')
export const loadNotifications = () => import('../pages/Notifications')

const SIGNED_IN_LOADERS = [
  loadDashboard,
  loadCreateUrl,
  loadCreateDetails,
  loadDesignQR,
  loadPayment,
  loadIntegration,
  loadFAQ,
  loadUserAccount,
  loadNotifications,
]

let signedInPrefetched = false

/** Warm the dashboard chunk on its own — called during the login round-trip so
 *  the post-login navigation lands on an already-loaded page. */
export function prefetchDashboard() {
  loadDashboard().catch(() => {})
}

/** Warm every signed-in chunk while the browser is idle. Runs once; never
 *  competes with the first paint it was split out to protect. */
export function prefetchSignedInRoutes() {
  if (signedInPrefetched || typeof window === 'undefined') return
  signedInPrefetched = true
  const schedule = window.requestIdleCallback || ((fn) => setTimeout(fn, 1200))
  schedule(() => {
    for (const load of SIGNED_IN_LOADERS) load().catch(() => {})
  })
}
