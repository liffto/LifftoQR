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

export default function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<Landing />} />
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
        <Route
          path="/create"
          element={
            <ProtectedRoute>
              <CreateUrl />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create/details"
          element={
            <ProtectedRoute>
              <CreateDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create/design/:websiteId"
          element={
            <ProtectedRoute>
              <DesignQR />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create/design"
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
