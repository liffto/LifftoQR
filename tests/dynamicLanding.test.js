import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { QR_TYPES, findType, dynamicLandsOnPage } from '../src/lib/qrTypes'
import { previewsAsQR } from '../src/components/ScanPreview'

const NEWLY_DYNAMIC = ['text', 'email', 'sms', 'phone']
const LANDING = [...NEWLY_DYNAMIC, 'whatsapp']

describe('the types that gained a dynamic mode', () => {
  it('offers dynamic for all five', () => {
    LANDING.forEach((key) => {
      expect(findType(key).dynamicCapable, `${key} should offer dynamic`).toBe(
        true,
      )
    })
  })

  it('leaves static as the default', () => {
    // Nothing here requires dynamic — the code works with no server involved,
    // and that has to stay the starting point.
    LANDING.forEach((key) => {
      expect(findType(key).requiresDynamic ?? false).toBe(false)
    })
  })

  it('lands on our page rather than redirecting', () => {
    LANDING.forEach((key) => {
      expect(dynamicLandsOnPage(key), `${key} should land`).toBe(true)
    })
  })

  it('does not change where any other type goes', () => {
    QR_TYPES.filter((t) => !LANDING.includes(t.key)).forEach((t) => {
      expect(dynamicLandsOnPage(t.key), `${t.key} should be unaffected`).toBe(
        false,
      )
    })
  })
})

describe('the front end and the API agree on which types land', () => {
  it('matches ALWAYS_LANDING_TYPE_KEYS in the API', () => {
    // Two lists in two languages decide the same thing: the server picks the
    // redirect, the client describes the choice and previews it. If they drift,
    // the create flow promises a landing page the scan never shows — so the
    // Python is read here rather than trusted.
    const py = readFileSync('api/app/services/qr_destination.py', 'utf8')
    const block = py.slice(
      py.indexOf('ALWAYS_LANDING_TYPE_KEYS'),
      py.indexOf(')', py.indexOf('ALWAYS_LANDING_TYPE_KEYS')),
    )
    const fromApi = [...block.matchAll(/"([a-z-]+)"/g)].map((m) => m[1])
    expect(fromApi.sort()).toEqual([...LANDING].sort())
  })
})

describe('what the creator is shown while choosing', () => {
  it('previews the landing page for a dynamic code, not a bare QR', () => {
    // Text and Phone preview as a plain QR when static, because scanning one is
    // a native OS action with no page in it. Dynamic changed that, and a
    // preview showing a bare QR would hide the page being made.
    expect(previewsAsQR('text', true)).toBe(false)
    expect(previewsAsQR('phone', true)).toBe(false)
  })

  it('still previews a bare QR for the static versions', () => {
    expect(previewsAsQR('text', false)).toBe(true)
    expect(previewsAsQR('phone', false)).toBe(true)
  })

  it('leaves types that were never QR-previewed alone', () => {
    expect(previewsAsQR('vcard', true)).toBe(false)
    expect(previewsAsQR('vcard', false)).toBe(false)
    // url redirects whether dynamic or not, so it keeps its bare-QR preview.
    expect(previewsAsQR('url', true)).toBe(true)
  })
})
