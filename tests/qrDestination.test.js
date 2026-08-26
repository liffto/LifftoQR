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

describe('the destination a saved QR offers to open', () => {
  it('offers nothing for a Wi-Fi code', () => {
    // The report: the dialog showed the heading and an open-link icon, and
    // clicking it reloaded the page behind the dialog.
    expect(destinationUrl({ typeKey: 'wifi', name: 'Wi-Fi: VEDANS', url: '' }))
      .toBeNull()
  })

  it('offers nothing for any of the types that encode content directly', () => {
    CONTENT_TYPES.forEach((typeKey) => {
      expect(destinationUrl({ typeKey, url: '' })).toBeNull()
    })
  })

  it('offers the link for a website code', () => {
    expect(destinationUrl({ typeKey: 'url', url: 'https://liffto.com' })).toBe(
      'https://liffto.com',
    )
  })

  it('never returns something a browser would treat as a relative path', () => {
    // A bare domain passes validation — the create form accepts it — but in an
    // href it is a path, so it lands on the current page exactly as "" does.
    const out = destinationUrl({ typeKey: 'url', url: 'example.com' })
    expect(out).toMatch(/^https?:\/\//)
  })

  it('offers nothing when the url is missing or unusable', () => {
    expect(destinationUrl({ typeKey: 'url' })).toBeNull()
    expect(destinationUrl({ typeKey: 'url', url: null })).toBeNull()
    expect(destinationUrl({ typeKey: 'url', url: '   ' })).toBeNull()
    expect(destinationUrl({ typeKey: 'url', url: 'not a url' })).toBeNull()
    // A Wi-Fi SSID is not a hostname, and must not be mistaken for one.
    expect(destinationUrl({ typeKey: 'wifi', url: 'VEDANS' })).toBeNull()
  })

  it('survives an empty or missing record', () => {
    expect(destinationUrl()).toBeNull()
    expect(destinationUrl({})).toBeNull()
  })
})
