import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import QueryProvider from '../src/providers/QueryProvider'
import { AuthProvider } from '../src/context/AuthContext'
import Login from '../src/pages/Login'

function renderLogin() {
  return render(
    <QueryProvider>
      <GoogleOAuthProvider clientId="test-client-id">
        <MemoryRouter>
          <AuthProvider>
            <Login />
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>
    </QueryProvider>,
  )
}

describe('Login page', () => {
  it('renders the welcome heading', () => {
    renderLogin()
    expect(screen.getByText(/welcome back/i)).toBeInTheDocument()
  })

  it('offers Google sign-in', () => {
    renderLogin()
    expect(screen.getByText(/continue with google/i)).toBeInTheDocument()
  })
})
