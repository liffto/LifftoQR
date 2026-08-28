import { describe, it, expect } from 'vitest'
import { destinationUrl } from '../src/lib/qrDestination'

// The nine types that encode their content straight into the pattern. Records
// of these carry an empty url, which is what put an unopenable "Destination
// URL" row in the details dialog.
const CONTENT_TYPES = [
  'text',
  'wifi',
  'vcard',
  'email',
  'sms',
  'phone',
  'event',
  'location',
  'coupon',
]

const dyn = (over = {}) => ({ qrType: 'Dynamic QR', dynamic: true, ...over })
const stat = (over = {}) => ({ qrType: 'Static QR', dynamic: false, ...over })

describe('the destination a saved QR offers to open', () => {
  it('offers nothing for a Wi-Fi code', () => {
    // The first report: the dialog showed the heading and an open-link icon,
    // and clicking it reloaded the page behind the dialog.
    expect(
      destinationUrl(stat({ typeKey: 'wifi', name: 'Wi-Fi: VEDANS', url: '' })),
    ).toBeNull()
  })

  it('offers nothing for any of the types that encode content directly', () => {
    CONTENT_TYPES.forEach((typeKey) => {
      expect(destinationUrl(stat({ typeKey, url: '' }))).toBeNull()
    })
  })

  it('offers nothing for a static code, even one carrying a valid url', () => {
    // The second report, and the reason the url field cannot decide this. A
    // static Text code was holding the short URL for its own slug, so the
    // dialog offered it as a destination — a real, openable address that the
    // code does not encode and never sends anyone to.
    expect(
      destinationUrl(
        stat({
          typeKey: 'text',
          name: 'dsftyuiuuiuydhfgh;liuyf',
          url: 'https://liffto-qr.vercel.app/iLI2mv',
          slug: 'iLI2mv',
        }),
      ),
    ).toBeNull()
  })

  it('offers the link for a static website code', () => {
    // No redirect, but the address *is* the content: it is written into the
    // pattern, and scanning it opens exactly that. The row is as true here as
    // for a dynamic code.
    expect(
      destinationUrl(stat({ typeKey: 'url', url: 'https://liffto.com' })),
    ).toBe('https://liffto.com')
  })

  it('does not extend that to other static types carrying a url', () => {
    // The Text code from the report is the case this protects: its url field
    // held a real, openable address that the code does not encode.
    expect(
      destinationUrl(
        stat({ typeKey: 'text', url: 'https://liffto-qr.vercel.app/iLI2mv' }),
      ),
    ).toBeNull()
    expect(
      destinationUrl(stat({ typeKey: 'wifi', url: 'https://liffto.com' })),
    ).toBeNull()
  })

  it('offers the link for a dynamic code', () => {
    expect(
      destinationUrl(dyn({ typeKey: 'url', url: 'https://liffto.com' })),
    ).toBe('https://liffto.com')
  })

  it('recognises a dynamic code from either the flag or the label', () => {
    expect(
      destinationUrl({ qrType: 'Dynamic QR', url: 'https://liffto.com' }),
    ).toBe('https://liffto.com')
    expect(destinationUrl({ dynamic: true, url: 'https://liffto.com' })).toBe(
      'https://liffto.com',
    )
  })

  it('never returns something a browser would treat as a relative path', () => {
    // A bare domain passes validation — the create form accepts it — but in an
    // href it is a path, so it lands on the current page exactly as "" does.
    const out = destinationUrl(dyn({ typeKey: 'url', url: 'example.com' }))
    expect(out).toMatch(/^https?:\/\//)
  })

  it('offers nothing when the url is missing or unusable', () => {
    expect(destinationUrl(dyn({ typeKey: 'url' }))).toBeNull()
    expect(destinationUrl(dyn({ typeKey: 'url', url: null }))).toBeNull()
    expect(destinationUrl(dyn({ typeKey: 'url', url: '   ' }))).toBeNull()
    expect(destinationUrl(dyn({ typeKey: 'url', url: 'not a url' }))).toBeNull()
    // A Wi-Fi SSID is not a hostname, and must not be mistaken for one.
    expect(destinationUrl(dyn({ typeKey: 'wifi', url: 'VEDANS' }))).toBeNull()
  })

  it('survives an empty or missing record', () => {
    expect(destinationUrl()).toBeNull()
    expect(destinationUrl({})).toBeNull()
  })
})
