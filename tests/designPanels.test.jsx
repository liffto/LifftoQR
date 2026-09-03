import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import QueryProvider from '../src/providers/QueryProvider'
import { AuthProvider } from '../src/context/AuthContext'
import { LoginModalProvider } from '../src/context/LoginModalContext'
import { defaultDesign } from '../src/lib/store'

vi.mock('../src/api/qrcode/userTemplates', () => ({
  listUserTemplates: vi.fn().mockResolvedValue([]),
  saveUserTemplate: vi.fn(),
  deleteUserTemplate: vi.fn(),
}))

import DesignQR from '../src/pages/DesignQR'

const seedDraft = () =>
  localStorage.setItem(
    'liffto.draft',
    JSON.stringify({
      typeKey: 'url',
      type: 'Website URL',
      content: { url: 'https://liffto.com' },
      url: 'https://liffto.com',
      dynamic: false,
      qrType: 'Static QR',
      name: 'Panel test',
      slug: 'paneltest',
      design: defaultDesign(),
    }),
  )

const renderDesign = () =>
  render(
    <QueryProvider>
      <GoogleOAuthProvider clientId="test-client-id">
        <MemoryRouter initialEntries={['/create/design']}>
          <AuthProvider>
            <LoginModalProvider>
              <Routes>
                <Route path="/create/design" element={<DesignQR />} />
              </Routes>
            </LoginModalProvider>
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>
    </QueryProvider>,
  )

const panel = (name) =>
  screen
    .getAllByRole('button', { expanded: undefined })
    .concat(screen.queryAllByRole('button'))
    .find((b) => b.hasAttribute('aria-expanded') && new RegExp(name, 'i').test(b.textContent))

beforeEach(() => {
  localStorage.clear()
  seedDraft()
  vi.clearAllMocks()
})

describe('the design page, split in two', () => {
  it('opens with both halves closed', async () => {
    // The whole point: the page used to arrive as a wall of controls — a name,
    // the content fields, logo, short URL, frames, patterns, corners and four
    // colour pickers, all at once on a desktop.
    renderDesign()
    expect(await screen.findByText('Edit details')).toBeInTheDocument()
    expect(screen.getByText('Customise QR')).toBeInTheDocument()

    expect(panel('Edit details')).toHaveAttribute('aria-expanded', 'false')
    expect(panel('Customise QR')).toHaveAttribute('aria-expanded', 'false')
    // Nothing from either half is on screen yet.
    expect(screen.queryByPlaceholderText('e.g. Summer Sale Promo')).not.toBeInTheDocument()
    expect(screen.queryByText('Add Logo')).not.toBeInTheDocument()
  })

  it('shows the content fields when details is opened', async () => {
    renderDesign()
    await screen.findByText('Edit details')
    fireEvent.click(panel('Edit details'))

    expect(screen.getByPlaceholderText('e.g. Summer Sale Promo')).toBeInTheDocument()
    expect(screen.getByDisplayValue('https://liffto.com')).toBeInTheDocument()
    // Opening one half must not drag the other open with it.
    expect(screen.queryByText('Add Logo')).not.toBeInTheDocument()
  })

  it('shows the design controls when customise is opened', async () => {
    renderDesign()
    await screen.findByText('Customise QR')
    fireEvent.click(panel('Customise QR'))

    expect(screen.getByText('Add Logo')).toBeInTheDocument()
    expect(screen.getByText('Frames')).toBeInTheDocument()
    expect(screen.getByText('Body Patterns')).toBeInTheDocument()
    expect(screen.getByText('Corners')).toBeInTheDocument()
  })

  it('lets both be open at once, for anyone who wants the old view', async () => {
    renderDesign()
    await screen.findByText('Edit details')
    fireEvent.click(panel('Edit details'))
    fireEvent.click(panel('Customise QR'))

    expect(panel('Edit details')).toHaveAttribute('aria-expanded', 'true')
    expect(panel('Customise QR')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByPlaceholderText('e.g. Summer Sale Promo')).toBeInTheDocument()
    expect(screen.getByText('Add Logo')).toBeInTheDocument()
  })

  it('closes again on a second press', async () => {
    renderDesign()
    await screen.findByText('Edit details')
    fireEvent.click(panel('Edit details'))
    expect(screen.getByPlaceholderText('e.g. Summer Sale Promo')).toBeInTheDocument()

    fireEvent.click(panel('Edit details'))
    expect(screen.queryByPlaceholderText('e.g. Summer Sale Promo')).not.toBeInTheDocument()
  })

  it('keeps the preview and the download button out of the panels', async () => {
    // Both are the reason the page exists, so neither is ever behind a click.
    renderDesign()
    expect(await screen.findByText('Preview')).toBeInTheDocument()
    // Rendered twice — a sticky bar for phones and one beside the preview on
    // wider screens — so both are checked rather than one picked arbitrarily.
    const buttons = screen.getAllByRole('button', { name: /download qr/i })
    expect(buttons.length).toBeGreaterThanOrEqual(1)
    buttons.forEach((b) => expect(b).toBeInTheDocument())
  })
})

describe('the nudge on Customise QR', () => {
  it('invites you in while nothing has been designed yet', async () => {
    // The studio — logos, frames, gradients, corner styles — now sits behind a
    // panel that starts closed, so a code arriving straight from the content
    // step would never see it existed.
    renderDesign()
    await screen.findByText('Customise QR')
    expect(panel('Customise QR').textContent).toMatch(/must try/i)
  })

  it('gives way once the design has been touched', async () => {
    // A badge urging you to try what you have already tried is noise, so it
    // steps aside for the name of whatever look is now in effect.
    const draft = JSON.parse(localStorage.getItem('liffto.draft'))
    draft.design = { ...defaultDesign(), bodyColor1: '#E11D48' }
    localStorage.setItem('liffto.draft', JSON.stringify(draft))

    renderDesign()
    await screen.findByText('Customise QR')
    expect(panel('Customise QR').textContent).not.toMatch(/must try/i)
  })

  it('does not put it on Edit details, which needs no encouragement', async () => {
    // Whoever is here already knows what their code points to; it is the
    // design half that goes unopened.
    renderDesign()
    await screen.findByText('Edit details')
    expect(panel('Edit details').textContent).not.toMatch(/must try/i)
  })
})
