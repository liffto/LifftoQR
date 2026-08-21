import { describe, it, expect } from 'vitest'
import { googleCalendarUrl, encodeContent } from '../src/lib/qrEncoders'

// A timed event's UTC stamp depends on the machine's timezone, because a
// datetime-local value carries none. Asserting a literal stamp would make
// these tests pass only in one zone, so the timed cases assert the contract
// that must hold everywhere — shape, and the span between the two ends.
// All-day values are derived by string slicing and explicit UTC arithmetic,
// so those can be pinned exactly.

const params = (url) => new URL(url).searchParams
const dates = (url) => params(url).get('dates').split('/')

const STAMP = /^\d{8}T\d{6}Z$/
const DATE = /^\d{8}$/

const stampToMs = (s) => {
  const [, y, mo, d, h, mi, sec] = s.match(
    /^(\d{4})(\d{2})(\d{2})T(\d{2})(\d{2})(\d{2})Z$/,
  )
  return Date.UTC(+y, +mo - 1, +d, +h, +mi, +sec)
}

describe('googleCalendarUrl', () => {
  it('points at the Google template endpoint', () => {
    const url = googleCalendarUrl({ title: 'Standup', start: '2026-08-15T09:00' })
    expect(url.startsWith('https://calendar.google.com/calendar/render?')).toBe(
      true,
    )
    expect(params(url).get('action')).toBe('TEMPLATE')
  })

  it('carries the title, location and description', () => {
    const url = googleCalendarUrl({
      title: 'Team Offsite',
      start: '2026-08-15T09:00',
      end: '2026-08-15T17:00',
      location: '123 Main St, Chennai',
      description: 'Agenda & dial-in',
    })
    const p = params(url)
    expect(p.get('text')).toBe('Team Offsite')
    expect(p.get('location')).toBe('123 Main St, Chennai')
    expect(p.get('details')).toBe('Agenda & dial-in')
  })

  it('uses UTC stamps for a timed event', () => {
    const [start, end] = dates(
      googleCalendarUrl({
        title: 'Call',
        start: '2026-08-15T09:00',
        end: '2026-08-15T10:30',
      }),
    )
    expect(start).toMatch(STAMP)
    expect(end).toMatch(STAMP)
    expect(stampToMs(end) - stampToMs(start)).toBe(90 * 60 * 1000)
  })

  it('defaults a missing end to one hour after the start', () => {
    const [start, end] = dates(
      googleCalendarUrl({ title: 'Call', start: '2026-08-15T09:00' }),
    )
    expect(stampToMs(end) - stampToMs(start)).toBe(60 * 60 * 1000)
  })

  it('uses bare dates for an all-day event, ending the day after', () => {
    const [start, end] = dates(
      googleCalendarUrl({
        title: 'Conference',
        allDay: 'Yes',
        start: '2026-08-15T00:00',
        end: '2026-08-17T00:00',
      }),
    )
    expect(start).toMatch(DATE)
    expect(end).toMatch(DATE)
    // End-exclusive: a run through the 17th ends on the 18th.
    expect(start).toBe('20260815')
    expect(end).toBe('20260818')
  })

  it('treats a single all-day date as one day', () => {
    const [start, end] = dates(
      googleCalendarUrl({
        title: 'Holiday',
        allDay: 'Yes',
        start: '2026-08-15T00:00',
      }),
    )
    expect(start).toBe('20260815')
    expect(end).toBe('20260816')
  })

  it('accepts a boolean allDay as well as the form’s "Yes"', () => {
    const [start] = dates(
      googleCalendarUrl({ title: 'X', allDay: true, start: '2026-08-15T00:00' }),
    )
    expect(start).toBe('20260815')
  })

  it('returns null without a usable start, so the button can be hidden', () => {
    expect(googleCalendarUrl({ title: 'No date' })).toBeNull()
    expect(googleCalendarUrl({ title: 'Bad', start: 'not-a-date' })).toBeNull()
    expect(googleCalendarUrl({})).toBeNull()
  })

  it('agrees with the .ics the QR itself encodes', () => {
    // The two must describe the same instant — a scanner that reads the code
    // and a visitor who taps the button should land on the same event.
    const content = {
      title: 'Launch',
      start: '2026-08-15T09:00',
      end: '2026-08-15T10:00',
    }
    const [start, end] = dates(googleCalendarUrl(content))
    const ics = encodeContent('event', content)
    expect(ics).toContain(`DTSTART:${start}`)
    expect(ics).toContain(`DTEND:${end}`)
  })

  it('escapes characters that would otherwise break the query string', () => {
    const url = googleCalendarUrl({
      title: 'Q&A / AMA',
      start: '2026-08-15T09:00',
      location: 'Hall #3, 50% off',
    })
    // Round-tripping through URL proves the encoding held.
    expect(params(url).get('text')).toBe('Q&A / AMA')
    expect(params(url).get('location')).toBe('Hall #3, 50% off')
  })
})
