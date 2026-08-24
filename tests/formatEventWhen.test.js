import { describe, it, expect } from 'vitest'
import { formatEventWhen, googleCalendarUrl } from '../src/lib/qrEncoders'

// The bug these cover: the scan page printed a clock time for an all-day
// event ("2026-08-21 · 17:33") while the Add-to-Calendar button directly
// beneath it correctly encoded the same event as all-day. Two code paths read
// the same record and disagreed, so the last test here pins them together.
//
// Every assertion is a literal. The formatter reads the datetime-local string
// by its parts instead of through Date on purpose — the stored value is the
// wall time the creator typed, with no zone — so unlike the calendar stamps
// these results are the same in every timezone.

describe('formatEventWhen', () => {
  describe('all-day events', () => {
    it('never shows a time, whatever hour is stored', () => {
      // 17:33 is when the record happened to be created, not an appointment.
      const when = formatEventWhen({
        allDay: 'Yes',
        start: '2026-08-21T17:33',
        end: '2026-08-22T16:37',
      })
      expect(when).not.toMatch(/17:33|16:37|\d{2}:\d{2}/)
    })

    it('shows a single day as one date', () => {
      expect(
        formatEventWhen({ allDay: 'Yes', start: '2026-08-21T00:00' }),
      ).toBe('21 Aug 2026 · All day')
    })

    it('shows a run of days as a range, ending on the last day itself', () => {
      // Not the 23rd: the exclusive end is a calendar-format detail that
      // belongs in the link, not on the page.
      expect(
        formatEventWhen({
          allDay: 'Yes',
          start: '2026-08-21T17:33',
          end: '2026-08-22T16:37',
        }),
      ).toBe('21 Aug 2026 – 22 Aug 2026 · All day')
    })

    it('accepts a boolean allDay as well as the form’s "Yes"', () => {
      expect(formatEventWhen({ allDay: true, start: '2026-08-21T09:00' })).toBe(
        '21 Aug 2026 · All day',
      )
    })
  })

  describe('timed events', () => {
    it('shows start and end when they fall on one day', () => {
      expect(
        formatEventWhen({ start: '2026-08-15T09:00', end: '2026-08-15T17:30' }),
      ).toBe('15 Aug 2026 · 09:00 – 17:30')
    })

    it('shows just the start when there is no end', () => {
      expect(formatEventWhen({ start: '2026-08-15T09:00' })).toBe(
        '15 Aug 2026 · 09:00',
      )
    })

    it('repeats the date when the event crosses midnight', () => {
      expect(
        formatEventWhen({ start: '2026-08-15T22:00', end: '2026-08-16T02:00' }),
      ).toBe('15 Aug 2026 · 22:00 – 16 Aug 2026 · 02:00')
    })

    it('reads the stored wall time rather than converting it', () => {
      // A Date round-trip would shift this by the reader's offset and show a
      // scanner the wrong hour.
      expect(formatEventWhen({ start: '2026-01-01T00:30' })).toContain('00:30')
      expect(formatEventWhen({ start: '2026-01-01T00:30' })).toContain(
        '1 Jan 2026',
      )
    })
  })

  it('returns empty without a usable date, so the row can be hidden', () => {
    expect(formatEventWhen({})).toBe('')
    expect(formatEventWhen({ start: '' })).toBe('')
    expect(formatEventWhen({ start: 'not-a-date' })).toBe('')
  })

  it('agrees with the calendar button about whether an event is all-day', () => {
    const allDay = {
      title: 'Conference',
      allDay: 'Yes',
      start: '2026-08-21T17:33',
      end: '2026-08-22T16:37',
    }
    const timed = {
      title: 'Call',
      start: '2026-08-21T17:33',
      end: '2026-08-21T18:00',
    }

    // All-day: bare dates in the link, no clock time on the page.
    expect(new URL(googleCalendarUrl(allDay)).searchParams.get('dates')).toBe(
      '20260821/20260823',
    )
    expect(formatEventWhen(allDay)).not.toMatch(/\d{2}:\d{2}/)

    // Timed: UTC stamps in the link, a clock time on the page.
    expect(
      new URL(googleCalendarUrl(timed)).searchParams.get('dates'),
    ).toMatch(/^\d{8}T\d{6}Z\/\d{8}T\d{6}Z$/)
    expect(formatEventWhen(timed)).toMatch(/17:33/)
  })
})
