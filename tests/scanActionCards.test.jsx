import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { GoogleOAuthProvider } from '@react-oauth/google'
import QueryProvider from '../src/providers/QueryProvider'
import { AuthProvider } from '../src/context/AuthContext'
import { LoginModalProvider } from '../src/context/LoginModalContext'

vi.mock('../src/api/qrcode/publicQr', () => ({
  getPublicQr: vi.fn(),
  vcardFileUrl: (slug) => `/api/v1/public/qrs/${slug}/vcard`,
}))

import { getPublicQr } from '../src/api/qrcode/publicQr'
import ScanLanding from '../src/pages/ScanLanding'

const renderScan = (slug) =>
  render(
    <QueryProvider>
      <GoogleOAuthProvider clientId="test-client-id">
        <MemoryRouter initialEntries={[`/s/${slug}`]}>
          <AuthProvider>
            <LoginModalProvider>
              <Routes>
                <Route path="/s/:slug" element={<ScanLanding />} />
              </Routes>
            </LoginModalProvider>
          </AuthProvider>
        </MemoryRouter>
      </GoogleOAuthProvider>
    </QueryProvider>,
  )

const qr = (typeKey, content) => ({
  typeKey,
  type: typeKey,
  name: 'Scan test',
  content,
})

beforeEach(() => vi.clearAllMocks())

describe('editing the message before it reaches your app', () => {
  it('carries an edited WhatsApp message into the link', async () => {
    // The prefilled message is a guess by whoever printed the sticker. The
    // scanner gets the last word on what it actually says.
    getPublicQr.mockResolvedValue(
      qr('whatsapp', { countryCode: '+91', phone: '9840012345', message: 'Hi there' }),
    )
    renderScan('wa-edit')

    const box = await screen.findByRole('textbox', { name: /message/i })
    fireEvent.change(box, { target: { value: 'Do you deliver to Adyar?' } })

    await waitFor(() => {
      const link = screen.getByRole('link', { name: /open whatsapp/i })
      const href = decodeURIComponent(link.getAttribute('href'))
      expect(href).toContain('Do you deliver to Adyar?')
      // The owner chose the recipient; editing the message must not move it.
      expect(href).toContain('wa.me/919840012345')
    })
  })

  it('carries an edited SMS message into the link', async () => {
    getPublicQr.mockResolvedValue(
      qr('sms', { number: '+91 98400 12345', message: 'Table for two' }),
    )
    renderScan('sms-edit')

    const box = await screen.findByRole('textbox', { name: /message/i })
    fireEvent.change(box, { target: { value: 'Table for six please' } })

    await waitFor(() => {
      const href = decodeURIComponent(
        screen.getByRole('link', { name: /open messages/i }).getAttribute('href'),
      )
      expect(href).toContain('Table for six please')
      expect(href).toContain('sms:+91 98400 12345')
    })
  })

  it('keeps the subject while the body is edited', async () => {
    getPublicQr.mockResolvedValue(
      qr('email', { to: 'hello@liffto.com', subject: 'Catering', body: 'Hi' }),
    )
    renderScan('email-edit')

    const box = await screen.findByRole('textbox', { name: /subject: catering/i })
    fireEvent.change(box, { target: { value: 'Quote for 40 people' } })

    await waitFor(() => {
      const href = decodeURIComponent(
        screen.getByRole('link', { name: /compose email/i }).getAttribute('href'),
      )
      expect(href).toContain('Quote for 40 people')
      expect(href).toContain('subject=Catering')
      expect(href).toContain('mailto:hello@liffto.com')
    })
  })

  it('leaves a note read-only, since there is nothing to send', async () => {
    getPublicQr.mockResolvedValue(qr('text', { text: "Today's special" }))
    renderScan('text-readonly')

    expect(await screen.findByText("Today's special")).toBeInTheDocument()
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })

  it('gives a phone code nothing to edit either', async () => {
    // A number is the whole content; there is no message to adjust.
    getPublicQr.mockResolvedValue(qr('phone', { phone: '+91 98400 12345' }))
    renderScan('phone-readonly')

    expect(await screen.findByRole('link', { name: /call now/i })).toHaveAttribute(
      'href',
      'tel:+91 98400 12345',
    )
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument()
  })
})

describe('the offer to make your own', () => {
  it('appears on every one of these pages', async () => {
    // The scanner is a stranger who has just watched the product work. It is
    // the one moment they are holding it.
    const cases = [
      ['text', { text: 'A note' }],
      ['phone', { phone: '+91 98400 12345' }],
      ['sms', { number: '+91 98400 12345' }],
      ['email', { to: 'hello@liffto.com' }],
      ['whatsapp', { countryCode: '+91', phone: '9840012345' }],
    ]
    for (const [typeKey, content] of cases) {
      getPublicQr.mockResolvedValue(qr(typeKey, content))
      const { unmount } = renderScan(`cta-${typeKey}`)
      expect(
        await screen.findByRole('button', { name: /create your own qr code/i }),
        `${typeKey} should offer it`,
      ).toBeInTheDocument()
      unmount()
    }
  })
})
