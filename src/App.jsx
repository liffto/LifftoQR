import { Navigate, Route, Routes } from 'react-router-dom'
import { isAuthed } from './lib/store'
import ErrorBoundary from './components/ErrorBoundary'
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

function RequireAuth({ children }) {
  return isAuthed() ? children : <Navigate to="/login" replace />
}

function Protected({ children }) {
  return <RequireAuth>{children}</RequireAuth>
}

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        />
        <Route
          path="/create"
          element={
            <Protected>
              <CreateUrl />
            </Protected>
          }
        />
        <Route
          path="/create/details"
          element={
            <Protected>
              <CreateDetails />
            </Protected>
          }
        />
        <Route
          path="/create/design"
          element={
            <Protected>
              <DesignQR />
            </Protected>
          }
        />
        <Route
          path="/payment"
          element={
            <Protected>
              <Payment />
            </Protected>
          }
        />
        <Route
          path="/integration"
          element={
            <Protected>
              <Integration />
            </Protected>
          }
        />
        <Route
          path="/faq"
          element={
            <Protected>
              <FAQ />
            </Protected>
          }
        />
        <Route
          path="/account"
          element={
            <Protected>
              <UserAccount />
            </Protected>
          }
        />
        <Route
          path="/notifications"
          element={
            <Protected>
              <Notifications />
            </Protected>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ErrorBoundary>
  )
}
