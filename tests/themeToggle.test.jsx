import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import QueryProvider from '../src/providers/QueryProvider'
import { AuthProvider } from '../src/context/AuthContext'
import { LoginModalProvider } from '../src/context/LoginModalContext'

// Layout fetches the notification list on mount; none of that is what this is
// about, and an unmocked query means a real request from jsdom.
vi.mock('../src/hooks/useNotifications', () => ({
  useNotifications: () => ({ data: [] }),
  useMarkNotificationRead: () => ({ mutate: vi.fn() }),
  useMarkAllNotificationsRead: () => ({ mutate: vi.fn() }),
}))

import Layout from '../src/components/Layout'

const renderLayout = () =>
  render(
    <QueryProvider>
      <GoogleOAuthProvider clientId="test-client-id">
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthProvider>
            <LoginModalProvider>
              <Layout breadcrumb="Dashboard">
                <p>page content</p>
              </Layout>
            </LoginModalProvider>
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>
    </QueryProvider>,
  )

beforeEach(() => {
  localStorage.clear()
  document.documentElement.classList.remove('dark')
})

afterEach(() => {
  document.documentElement.classList.remove('dark')
})

describe('the theme switch in the signed-in header', () => {
  it('is on the page every signed-in route shares', async () => {
    // It used to live only on the landing page, so signing in stranded you in
    // whichever theme you happened to be in with no way back out.
    renderLayout()
    expect(
      await screen.findByRole('button', { name: /switch to dark mode/i }),
    ).toBeInTheDocument()
  })

  it('flips the palette and remembers the choice', async () => {
    renderLayout()
    fireEvent.click(
      await screen.findByRole('button', { name: /switch to dark mode/i }),
    )

    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(localStorage.getItem('liffto.theme')).toBe('dark')
    // The button has to say what it will do next, not what it just did.
    expect(
      screen.getByRole('button', { name: /switch to light mode/i }),
    ).toBeInTheDocument()
  })

  it('flips back', async () => {
    renderLayout()
    fireEvent.click(
      await screen.findByRole('button', { name: /switch to dark mode/i }),
    )
    fireEvent.click(
      screen.getByRole('button', { name: /switch to light mode/i }),
    )

    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(localStorage.getItem('liffto.theme')).toBe('light')
  })

  it('opens in the theme that was already chosen', async () => {
    localStorage.setItem('liffto.theme', 'dark')
    renderLayout()
    // The first render deliberately assumes light so the prerendered landing
    // page still hydrates; the effect corrects it a frame later.
    expect(
      await screen.findByRole('button', { name: /switch to light mode/i }),
    ).toBeInTheDocument()
  })
})
