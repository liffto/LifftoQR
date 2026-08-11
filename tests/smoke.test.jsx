import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import QueryProvider from '../src/providers/QueryProvider'
import { AuthProvider } from '../src/context/AuthContext'
import {
  LoginModalProvider,
  useLoginModal,
} from '../src/context/LoginModalContext'

// Signing in is a dialog opened over whatever page you were on, so the test
// drives it the way the app does — through openLogin — rather than rendering
// the form directly.
function Opener() {
  const { openLogin } = useLoginModal()
  return (
    <button type="button" onClick={() => openLogin()}>
      trigger
    </button>
  )
}

function renderApp() {
  return render(
    <QueryProvider>
      <GoogleOAuthProvider clientId="test-client-id">
        <MemoryRouter>
          <AuthProvider>
            <LoginModalProvider>
              <Opener />
            </LoginModalProvider>
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>
    </QueryProvider>,
  )
}

describe('Sign-in dialog', () => {
  it('stays closed until something asks for it', () => {
    renderApp()
    expect(screen.queryByText(/welcome back/i)).not.toBeInTheDocument()
  })

  it('renders the welcome heading once opened', () => {
    renderApp()
    fireEvent.click(screen.getByText('trigger'))
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  })

  it('offers Google sign-in', () => {
    renderApp()
    fireEvent.click(screen.getByText('trigger'))
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
  })
})
