import { describe, it, expect } from 'vitest'
import { destinationUrl } from '../src/lib/qrDestination'
import { QR_TYPES } from '../src/lib/qrTypes'

// The nine types that encode their content straight into the pattern, and the
// eleven that carry an address. Checked against the registry below, so these
// cannot drift from where the line is actually drawn.
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

const LINK_TYPES = [
  'url',
  'whatsapp',
  'social',
  'google-review',
  'pdf',
  'video',
  'mp3',
  'app',
  'linktree',
  'invitation',
  'feedback',
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

  it('offers nothing for a Text code carrying a perfectly valid url', () => {
    // The second report, and the reason the url field cannot decide this. A
    // static Text code was holding the short URL for its own slug, so the
    // dialog offered it as a destination — a real, openable address that the
    // code does not encode and never sends anyone to.
    expect(
      destinationUrl(
        stat({
          typeKey: 'text',
          name: 'dsftyuiuuiuydhfgh;liuyf',
          url: 'https://qr-api.liffto.in/iLI2mv',
          slug: 'iLI2mv',
        }),
      ),
    ).toBeNull()
  })

  it('offers the link for every static link-kind code', () => {
    // No redirect, but the address *is* the content: it is written into the
    // pattern, and scanning it opens exactly that. As true for a WhatsApp or a
    // PDF code as for a website one.
    LINK_TYPES.forEach((typeKey) => {
      expect(
        destinationUrl(stat({ typeKey, url: 'https://liffto.com' })),
        `${typeKey} should offer its destination`,
      ).toBe('https://liffto.com')
    })
  })

  it('agrees with the registry about which types are links', () => {
    // Listing the keys here would let a type added later be classified in one
    // place and forgotten in the other.
    const fromRegistry = QR_TYPES.filter((t) => t.kind === 'link').map((t) => t.key)
    expect([...LINK_TYPES].sort()).toEqual([...fromRegistry].sort())
    expect([...CONTENT_TYPES].sort()).toEqual(
      QR_TYPES.filter((t) => t.kind === 'data')
        .map((t) => t.key)
        .sort(),
    )
  })

  it('does not extend that to static types that encode content directly', () => {
    // The Text code from the report is the case this protects: its url field
    // held a real, openable address that the code does not encode.
    expect(
      destinationUrl(
        stat({ typeKey: 'text', url: 'https://qr-api.liffto.in/iLI2mv' }),
      ),
    ).toBeNull()
    CONTENT_TYPES.forEach((typeKey) => {
      expect(
        destinationUrl(stat({ typeKey, url: 'https://liffto.com' })),
        `${typeKey} should not offer a destination`,
      ).toBeNull()
    })
  })

  it('treats an unrecognised type as having nowhere to go', () => {
    // findType falls back to the website type, which would quietly promote an
    // unknown key to link-kind; this reads the map directly to avoid that.
    expect(
      destinationUrl(stat({ typeKey: 'nonsense', url: 'https://liffto.com' })),
    ).toBeNull()
    expect(
      destinationUrl(stat({ url: 'https://liffto.com' })),
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
