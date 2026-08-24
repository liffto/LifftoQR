import { describe, it, expect } from 'vitest'
import { draftHasContent, buildRecord } from '../src/lib/qrDraft'
import { defaultContent } from '../src/lib/qrTypes'

// This guards the discard warning on the landing page. Getting it wrong in
// either direction is bad in a specific way: too eager and the warning fires
// on every type switch until people click through it without reading; too lax
// and it stays silent while real work is thrown away, which is the bug it
// exists to fix.

const draftFor = (typeKey, content = {}) =>
  buildRecord(typeKey, { ...defaultContent(typeKey), ...content }, false)

describe('draftHasContent', () => {
  it('is false for a draft nobody has typed into', () => {
    // The trap: defaultContent pre-fills selects, so an untouched Wi-Fi draft
    // still arrives carrying auth: 'WPA'. Blank-checking would call that
    // content and warn about discarding nothing.
    expect(draftHasContent(draftFor('wifi'))).toBe(false)
    expect(draftHasContent(draftFor('url'))).toBe(false)
    expect(draftHasContent(draftFor('vcard'))).toBe(false)
    expect(draftHasContent(draftFor('event'))).toBe(false)
  })

  it('is true once a field carries something the visitor entered', () => {
    expect(
      draftHasContent(draftFor('url', { url: 'https://example.com' })),
    ).toBe(true)
    expect(draftHasContent(draftFor('wifi', { ssid: 'Cafe' }))).toBe(true)
    expect(draftHasContent(draftFor('vcard', { firstName: 'Ada' }))).toBe(true)
  })

  it('notices a changed dropdown, not just typed text', () => {
    // Wi-Fi security switched off its default is a real edit.
    expect(draftHasContent(draftFor('wifi', { auth: 'WEP' }))).toBe(true)
  })

  it('handles the repeatable link-tree rows', () => {
    expect(draftHasContent(draftFor('linktree'))).toBe(false)
    expect(
      draftHasContent(
        draftFor('linktree', {
          links: [{ label: 'Instagram', url: 'https://instagram.com/x' }],
        }),
      ),
    ).toBe(true)
  })

  it('is false for anything that is not a usable draft', () => {
    expect(draftHasContent(null)).toBe(false)
    expect(draftHasContent(undefined)).toBe(false)
    expect(draftHasContent({})).toBe(false)
    expect(draftHasContent({ typeKey: 'url' })).toBe(false)
  })
})
