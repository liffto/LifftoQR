import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './middleware/ProtectedRoute'
import PublicRoute from './middleware/PublicRoute'
import {
  loadDashboard,
  loadCreateUrl,
  loadCreateDetails,
  loadDesignQR,
  loadPayment,
  loadIntegration,
  loadFAQ,
  loadUserAccount,
  loadNotifications,
  loadFolders,
} from './lib/routePrefetch'

// The landing page is the one thing that must never wait on a second round
// trip, so it stays in the main bundle.
import Landing from './pages/Landing'

// Everything else is fetched when it is actually routed to. A first-time
// visitor was downloading and parsing the dashboard, the design studio, the
// account screen and every type form before the landing page could paint —
// roughly 186KB of source for screens they had not asked for.
const RELOAD_FLAG = 'liffto.chunk-reloaded'

const page = (load) =>
  lazy(() =>
    load()
      .then((mod) => {
        sessionStorage.removeItem(RELOAD_FLAG)
        return mod
      })
      .catch((err) => {
        // A chunk that fails to load is almost always a tab left open across
        // a deploy asking for a filename that no longer exists. Reloading
        // picks up the current index.html. The flag stops it looping when the
        // cause is something else — offline, or a genuinely broken build.
        if (!sessionStorage.getItem(RELOAD_FLAG)) {
          sessionStorage.setItem(RELOAD_FLAG, '1')
          window.location.reload()
          // Never settles; the reload replaces the page before React needs it.
          return new Promise(() => {})
        }
        throw err
      }),
  )

// Split from the landing page rather than shipped alongside it. The two are
// mutually exclusive — you either arrive at the site or you scanned a code —
// yet every visitor was downloading both. Making this one lazy costs a scanner
// nothing measurable: the page cannot render until getPublicQr comes back, and
// the chunk is fetched in parallel with that request.
// Signed-in page chunks are prefetched (not only routed to) to kill the white
// flash on first navigation — see src/lib/routePrefetch.js. Their loaders are
// imported from there so both the lazy() defs and the prefetch use one cached
// import().
const ScanLanding = page(() => import('./pages/ScanLanding'))
const Login = page(() => import('./pages/Login'))
const Dashboard = page(loadDashboard)
const Folders = page(loadFolders)
const CreateUrl = page(loadCreateUrl)
const CreateDetails = page(loadCreateDetails)
const DesignQR = page(loadDesignQR)
const Payment = page(loadPayment)
const Integration = page(loadIntegration)
const FAQ = page(loadFAQ)
const UserAccount = page(loadUserAccount)
const Notifications = page(loadNotifications)
const Terms = page(() =>
  import('./pages/Legal').then((m) => ({ default: m.Terms })),
)
const Privacy = page(() =>
  import('./pages/Legal').then((m) => ({ default: m.Privacy })),
)

// Deliberately quiet: on a warm cache these chunks arrive in a few
// milliseconds, and a spinner that flashes in and straight out reads as a
// glitch. The canvas background keeps the swap from flashing white.
function RouteFallback() {
  return <div className="min-h-screen bg-canvas" aria-busy="true" />
}

export default function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<RouteFallback />}>
        <Routes>
          <Route path="/" element={<Landing />} />
          {/* Public scan landing page — reached by whoever scans a dynamic QR
              whose content has no destination to redirect to. Never gated. */}
          <Route path="/s/:slug" element={<ScanLanding />} />
          {/* Linked from the sign-in dialog and the footer. Public: the dialog
              asks people to agree to them before they have an account. */}
          <Route path="/terms" element={<Terms />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* Folders. The grid of them, and one folder's contents — which is
              the dashboard list with one more filter, rendered by the same
              component so the two lists cannot drift apart. */}
          <Route
            path="/folders"
            element={
              <ProtectedRoute>
                <Folders />
              </ProtectedRoute>
            }
          />
          <Route
            path="/folders/:folderId"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          {/* The draft create flow is open. Making a static code needs nothing
              from the server — it is drawn and downloaded in the browser — so
              requiring an account here only cost first-time visitors their
              momentum. The account is still required for a dynamic code, which
              genuinely needs a short link we host; that gate now lives with the
              dynamic choice itself rather than on the route. */}
          <Route path="/create" element={<CreateUrl />} />
          <Route path="/create/details" element={<CreateDetails />} />
          <Route path="/create/design" element={<DesignQR />} />
          {/* Editing an already-saved code is a different thing: it loads that
              record from the API by id, so it stays behind the gate. */}
          <Route
            path="/create/design/:websiteId"
            element={
              <ProtectedRoute>
                <DesignQR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/payment"
            element={
              <ProtectedRoute>
                <Payment />
              </ProtectedRoute>
            }
          />
          <Route
            path="/integration"
            element={
              <ProtectedRoute>
                <Integration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/faq"
            element={
              <ProtectedRoute>
                <FAQ />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <UserAccount />
              </ProtectedRoute>
            }
          />
          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
