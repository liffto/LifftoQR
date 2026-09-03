import { describe, it, expect } from 'vitest'
import { QR_TYPES, deriveContentName, findType } from '../src/lib/qrTypes'

describe('the name a code gets from its content', () => {
  it('does not repeat the type', () => {
    // Every screen showing a name shows the type beside it — an icon and label
    // in the list, a badge in the details dialog. "WhatsApp: +919843137477"
    // spent its first eleven characters saying what the badge already said, and
    // pushed the number that identifies the code out of a narrow column.
    const cases = [
      ['whatsapp', { countryCode: '+91', phone: '9843137477' }, '+919843137477'],
      ['pdf', { url: 'https://zenmatrix.in' }, 'zenmatrix.in'],
      ['pdf', { url: 'https://zenmatrix.in/brochure.pdf' }, 'brochure.pdf'],
      ['wifi', { ssid: 'VEDANS' }, 'VEDANS'],
      ['email', { to: 'hello@liffto.com' }, 'hello@liffto.com'],
      ['sms', { number: '+91 98400 12345' }, '+91 98400 12345'],
      ['phone', { phone: '+91 98400 12345' }, '+91 98400 12345'],
      ['vcard', { firstName: 'Jane', lastName: 'Doe' }, 'Jane Doe'],
      ['event', { title: 'Team Offsite' }, 'Team Offsite'],
      ['video', { url: 'https://youtu.be/abc' }, 'youtu.be'],
      ['mp3', { title: 'My Track' }, 'My Track'],
      ['app', { name: 'My App' }, 'My App'],
      ['linktree', { title: 'My Links' }, 'My Links'],
      ['location', { label: 'Head Office' }, 'Head Office'],
      ['google-review', { businessName: 'Acme Coffee' }, 'Acme Coffee'],
      ['invitation', { title: 'Wedding' }, 'Wedding'],
      ['feedback', { url: 'https://forms.gle/x' }, 'forms.gle'],
      ['coupon', { title: '20% off', code: 'SAVE20' }, '20% off (SAVE20)'],
    ]
    cases.forEach(([key, content, expected]) => {
      expect(deriveContentName(key, content), key).toBe(expected)
    })
  })

  it('never starts a name with its own type label', () => {
    // Catches the whole class rather than the eighteen cases above, so a type
    // added later cannot quietly reintroduce it.
    QR_TYPES.forEach((t) => {
      const name = deriveContentName(t.key, {
        // enough content that the fallback branch is not what is being tested
        ssid: 'Net',
        to: 'a@b.com',
        number: '123',
        phone: '123',
        firstName: 'Jane',
        title: 'Thing',
        name: 'Thing',
        businessName: 'Thing',
        label: 'Thing',
        code: 'X1',
        url: 'https://example.com',
        countryCode: '+91',
        handle: 'someone',
      })
      expect(
        name.toLowerCase().startsWith(`${t.label.toLowerCase()}:`),
        `${t.key} name "${name}" repeats its type`,
      ).toBe(false)
    })
  })

  it('falls back to the type when there is no content to name', () => {
    // With nothing filled in, the type is the only thing there is to say — so
    // these keep it rather than rendering an empty row.
    expect(deriveContentName('whatsapp', {})).toBe('WhatsApp')
    expect(deriveContentName('pdf', {})).toBe('PDF')
    expect(deriveContentName('wifi', {})).toBe('Wi-Fi network')
    expect(deriveContentName('email', {})).toBe('Email')
    expect(deriveContentName('phone', {})).toBe('Phone')
    expect(deriveContentName('event', {})).toBe('Calendar event')
  })

  it('never returns an empty name', () => {
    QR_TYPES.forEach((t) => {
      expect(deriveContentName(t.key, {}).trim().length, t.key).toBeGreaterThan(0)
    })
  })

  it('keeps the platform on a social code, which the badge does not show', () => {
    // The badge says "Social Media" — which of the twelve platforms it is only
    // appears here, so this one is information rather than repetition.
    expect(findType('social').label).toBe('Social Media')
    expect(deriveContentName('social', { platform: 'instagram', handle: 'liffto' })).toBe(
      'Instagram: @liffto',
    )
  })
})
