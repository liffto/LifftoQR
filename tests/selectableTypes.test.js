import { describe, it, expect } from 'vitest'
import {
  QR_TYPES,
  QR_TYPE_MAP,
  SELECTABLE_QR_TYPES,
  isOfferedType,
  findType,
} from '../src/lib/qrTypes'

const WITHDRAWN = [
  'video',
  'mp3',
  'pdf',
  'location',
  'social',
  'google-review',
  'invitation',
]

describe('which types are offered when creating a code', () => {
  it('does not offer the withdrawn ones', () => {
    const offered = SELECTABLE_QR_TYPES.map((t) => t.key)
    WITHDRAWN.forEach((key) => {
      expect(offered, `${key} should not be offered`).not.toContain(key)
      expect(isOfferedType(key)).toBe(false)
    })
  })

  it('offers everything else', () => {
    expect(SELECTABLE_QR_TYPES).toHaveLength(QR_TYPES.length - WITHDRAWN.length)
    QR_TYPES.filter((t) => !WITHDRAWN.includes(t.key)).forEach((t) => {
      expect(isOfferedType(t.key)).toBe(true)
    })
  })

  it('keeps the withdrawn types in the registry', () => {
    // The point of the change. Codes of these types are already printed and in
    // circulation: the dashboard has to name them, the scan page has to render
    // them, and their edit screens have to keep working. Dropping them from the
    // registry would break every one of those.
    WITHDRAWN.forEach((key) => {
      expect(QR_TYPE_MAP[key], `${key} must stay in the registry`).toBeDefined()
      expect(findType(key).key).toBe(key)
      expect(findType(key).label).toBeTruthy()
      expect(typeof findType(key).encode).toBe('function')
    })
  })

  it('gives every offered type what a picker needs to draw it', () => {
    SELECTABLE_QR_TYPES.forEach((t) => {
      expect(t.label, `${t.key} needs a label`).toBeTruthy()
      expect(t.Icon, `${t.key} needs an icon`).toBeTruthy()
      expect(t.tint, `${t.key} needs a tint`).toBeTruthy()
    })
  })

  it('leaves the fallback type offered', () => {
    // findType falls back to the website type for anything unrecognised, so
    // withdrawing that one would point the fallback at something the pickers no
    // longer list.
    expect(isOfferedType('url')).toBe(true)
    expect(isOfferedType(findType('nonsense').key)).toBe(true)
  })
})
