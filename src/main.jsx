import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './context/AuthContext'
import { LoginModalProvider } from './context/LoginModalContext'
import App from './App.jsx'
import { initErrorTracking } from './lib/errorTracking'
import './index.css'

// GoogleOAuthProvider used to sit here, wrapping everything. It loads Google's
// gsi/client script from accounts.google.com the moment it mounts, so every
// visitor paid for the sign-in machinery — a third-party request and the
// library behind it — including the ones who only ever look at the landing
// page. It now lives inside LoginPanel, which is the only thing that needs it
// and is itself loaded on demand.
function Root() {
  return (
    <QueryProvider>
      <BrowserRouter>
        <AuthProvider>
          <LoginModalProvider>
            <App />
          </LoginModalProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                borderRadius: '10px',
                fontSize: '14px',
              },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryProvider>
  )
}

const container = document.getElementById('root')
const tree = (
  <React.StrictMode>
    <Root />
  </React.StrictMode>
)

// The landing page is baked into its HTML at build time, so there is already a
// real page on screen by the time this runs — adopt it rather than rebuild it.
// Every other route is served a plain shell and mounts normally.
//
// The path check is not redundant with the marker. Vercel rewrites unknown
// paths to a file, and if that ever pointed at the prerendered one, hydrating
// the landing markup while the router renders something else would mismatch
// every node. Cheap insurance against a config change made elsewhere.
if (container.dataset.prerendered === '/' && window.location.pathname === '/') {
  ReactDOM.hydrateRoot(container, tree)
} else {
  ReactDOM.createRoot(container).render(tree)
}

// Last, and idle-deferred inside — nothing about reporting errors is allowed to
// delay showing the page. No-ops entirely unless VITE_SENTRY_DSN is set.
initErrorTracking()
