import { describe, it, expect } from 'vitest'
import { incompleteFields, isComplete, defaultContent } from '../src/lib/qrEncoders'

// The details form used to disable its submit button and say nothing, leaving
// people to hunt a ten-field form for the blank one. It now names what is
// missing, which only works if this list is right — and if it agrees with
// isComplete, since the two are read side by side on the same screen.

describe('incompleteFields', () => {
  it('lists every required field on an untouched form', () => {
    const missing = incompleteFields('vcard', defaultContent('vcard'))
    expect(missing).toContain('firstName')
    expect(missing.length).toBeGreaterThan(0)
  })

  it('drops a field as soon as it is satisfied', () => {
    const content = { ...defaultContent('vcard'), firstName: 'Ada' }
    expect(incompleteFields('vcard', content)).not.toContain('firstName')
  })

  it('ignores optional fields entirely', () => {
    // Wi-Fi requires the network name; the password is optional.
    const missing = incompleteFields('wifi', {
      ...defaultContent('wifi'),
      ssid: 'Cafe',
    })
    expect(missing).not.toContain('password')
    expect(missing).toEqual([])
  })

  it('applies the same validity rules as submission, not just blankness', () => {
    // A URL that is present but not a usable link still counts as missing,
    // because isComplete would reject it too.
    const bad = { ...defaultContent('url'), url: 'not a url' }
    expect(incompleteFields('url', bad)).toContain('url')

    const good = { ...defaultContent('url'), url: 'https://liffto.com' }
    expect(incompleteFields('url', good)).toEqual([])
  })

  it('treats a link-tree row with no URL as unfilled', () => {
    expect(incompleteFields('linktree', defaultContent('linktree')).length)
      .toBeGreaterThan(0)
    const filled = {
      ...defaultContent('linktree'),
      links: [{ label: 'Site', url: 'https://liffto.com' }],
    }
    expect(incompleteFields('linktree', filled)).toEqual([])
  })

  it('agrees with isComplete on every type', () => {
    // If these ever disagree the form can show a green light and an error at
    // the same time, so this is the assertion that actually matters.
    for (const key of ['url', 'wifi', 'vcard', 'event', 'text', 'linktree']) {
      const blank = defaultContent(key)
      expect(isComplete(key, blank)).toBe(incompleteFields(key, blank).length === 0)
    }
  })
})
