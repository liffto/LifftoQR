import { StrictMode } from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'
import { Toaster } from 'react-hot-toast'
import QueryProvider from './providers/QueryProvider'
import { AuthProvider } from './context/AuthContext'
import { LoginModalProvider } from './context/LoginModalContext'
import App from './App.jsx'

/**
 * Build-time only. Renders a route to HTML so the visitor sees the real page
 * instead of a spinner while the app downloads.
 *
 * This is not a server: nothing here runs per request. `npm run build` calls it
 * once per prerendered route and bakes the result into a static file.
 *
 * The tree mirrors main.jsx exactly, with StaticRouter standing in for
 * BrowserRouter because there is no history to read. Everything else has to
 * stay, Toaster included: hydration compares the two trees node for node, and
 * anything rendered on only one side is a mismatch.
 *
 * Nothing that touches the DOM needs guarding here, which is worth stating
 * because it looks like it should. Effects do not run during renderToString, so
 * the QR previews emit their empty sized holder and fill in on the client
 * exactly as they already do — the markup matches on both sides. Lazy routes
 * and the scan demos suspend and render their fallbacks, which is what the
 * client's first render produces too. And the localStorage helpers all read
 * through a try/catch that returns a default, so under Node they yield the
 * logged-out, light-theme state — the state this file exists to render.
 */
export function render(path) {
  return renderToString(
    <StrictMode>
      <QueryProvider>
        <StaticRouter location={path}>
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
        </StaticRouter>
      </QueryProvider>
    </StrictMode>,
  )
}
