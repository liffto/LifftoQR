import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'

// LoginPanel reads VITE_CLIENT_ID once, at module scope, so changing it means
// re-evaluating the module — and everything holding React context alongside it,
// or the providers rendered here would be different instances from the ones the
// panel's hooks look for.
async function renderPanelWithClientId(clientId) {
  vi.stubEnv('VITE_CLIENT_ID', clientId)
  vi.resetModules()

  const [
    { MemoryRouter },
    { default: QueryProvider },
    { AuthProvider },
    { default: LoginPanel },
  ] = await Promise.all([
    import('react-router-dom'),
    import('../src/providers/QueryProvider'),
    import('../src/context/AuthContext'),
    import('../src/components/LoginPanel'),
  ])

  return render(
    <QueryProvider>
      <MemoryRouter>
        <AuthProvider>
          <LoginPanel />
        </AuthProvider>
      </MemoryRouter>
    </QueryProvider>,
  )
}

// Generous on purpose. Re-evaluating the module graph means the provider tree,
// react-query and the router are all built from scratch rather than reused, and
// the first of these measured 4.9s against the 5s default — passing, but close
// enough that a loaded CI machine would fail it for no reason. The work is
// slow, not stuck.
const RESET_TIMEOUT_MS = 30_000

describe('sign-in panel in a build with no Google client id', () => {
  afterEach(() => {
    vi.unstubAllEnvs()
    vi.resetModules()
  })

  it('does not offer a button that would fail at Google', async () => {
    // With no client id the button still opened Google, which refused the
    // request and showed "Access blocked: Authorization Error — Missing
    // required parameter: client_id". That reads as a problem with the
    // visitor's account rather than with the build.
    await renderPanelWithClientId('')

    expect(screen.queryByText(/continue with google/i)).not.toBeInTheDocument()
    expect(screen.getByText(/sign-in isn't configured/i)).toBeInTheDocument()
  }, RESET_TIMEOUT_MS)

  it('offers Google sign-in as soon as one is configured', async () => {
    await renderPanelWithClientId('something.apps.googleusercontent.com')

    expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
    expect(
      screen.queryByText(/sign-in isn't configured/i),
    ).not.toBeInTheDocument()
  }, RESET_TIMEOUT_MS)
})
