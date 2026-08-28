import { describe, it, expect } from 'vitest'
import { eventStatus } from '../src/lib/qrTypes'

// A fixed "now" so these never depend on when they run: 15 June 2026, 14:30.
const NOW = new Date(2026, 5, 15, 14, 30).getTime()

const at = (y, mo, d, h = 0, mi = 0) =>
  `${y}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`

describe('where an event sits relative to now', () => {
  it('calls a future event upcoming', () => {
    const c = { start: at(2026, 6, 20, 9, 0), end: at(2026, 6, 20, 17, 0) }
    expect(eventStatus(c, NOW)).toBe('upcoming')
  })

  it('calls a finished event ended', () => {
    // The report: a code on a poster for last month's thing still read as an
    // invitation and still offered to add it to a calendar.
    const c = { start: at(2026, 5, 1, 9, 0), end: at(2026, 5, 1, 17, 0) }
    expect(eventStatus(c, NOW)).toBe('ended')
  })

  it('calls an event in progress happening now', () => {
    const c = { start: at(2026, 6, 15, 9, 0), end: at(2026, 6, 15, 17, 0) }
    expect(eventStatus(c, NOW)).toBe('now')
  })

  it('flips exactly at the boundaries, not around them', () => {
    const startsNow = { start: at(2026, 6, 15, 14, 30), end: at(2026, 6, 15, 16, 0) }
    expect(eventStatus(startsNow, NOW)).toBe('now')

    const endedAMinuteAgo = {
      start: at(2026, 6, 15, 12, 0),
      end: at(2026, 6, 15, 14, 29),
    }
    expect(eventStatus(endedAMinuteAgo, NOW)).toBe('ended')

    const startsInAMinute = {
      start: at(2026, 6, 15, 14, 31),
      end: at(2026, 6, 15, 16, 0),
    }
    expect(eventStatus(startsInAMinute, NOW)).toBe('upcoming')
  })

  describe('all-day events', () => {
    it('runs to the end of the day, not its first moment', () => {
      // Today, all day. At half past two it is very much still on.
      const c = { start: '2026-06-15', allDay: 'Yes' }
      expect(eventStatus(c, NOW)).toBe('now')
    })

    it('is over once the last day is past', () => {
      const c = { start: '2026-06-13', end: '2026-06-14', allDay: 'Yes' }
      expect(eventStatus(c, NOW)).toBe('ended')
    })

    it('is still on during the last day of a run', () => {
      const c = { start: '2026-06-14', end: '2026-06-15', allDay: 'Yes' }
      expect(eventStatus(c, NOW)).toBe('now')
    })

    it('accepts the boolean form of the all-day flag', () => {
      expect(eventStatus({ start: '2026-06-15', allDay: true }, NOW)).toBe('now')
    })
  })

  describe('records that are missing something', () => {
    it('says nothing when there is no start date to judge by', () => {
      expect(eventStatus({}, NOW)).toBeNull()
      expect(eventStatus({ start: '' }, NOW)).toBeNull()
      expect(eventStatus({ start: 'not a date' }, NOW)).toBeNull()
      expect(eventStatus(undefined, NOW)).toBeNull()
    })

    it('does not call a timed event over the minute it begins', () => {
      // The end field is required, but a record saved before it was — or
      // edited around — should last out its day rather than expire instantly.
      const startedThisMorning = { start: at(2026, 6, 15, 9, 0) }
      expect(eventStatus(startedThisMorning, NOW)).toBe('now')

      const yesterday = { start: at(2026, 6, 14, 9, 0) }
      expect(eventStatus(yesterday, NOW)).toBe('ended')
    })

    it('handles an end that is unparseable by falling back to the start day', () => {
      const c = { start: at(2026, 6, 15, 9, 0), end: 'whenever' }
      expect(eventStatus(c, NOW)).toBe('now')
    })
  })
})
