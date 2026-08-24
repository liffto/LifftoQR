import { Navigate, Route, Routes } from 'react-router-dom'
import ErrorBoundary from './components/ErrorBoundary'
import ProtectedRoute from './middleware/ProtectedRoute'
import PublicRoute from './middleware/PublicRoute'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import CreateUrl from './pages/CreateUrl'
import CreateDetails from './pages/CreateDetails'
import DesignQR from './pages/DesignQR'
import Payment from './pages/Payment'
import Integration from './pages/Integration'
import FAQ from './pages/FAQ'
import UserAccount from './pages/UserAccount'
import Notifications from './pages/Notifications'
import ScanLanding from './pages/ScanLanding'
import { Terms, Privacy } from './pages/Legal'

export default function App() {
  return (
    <ErrorBoundary>
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
    </ErrorBoundary>
  )
}
