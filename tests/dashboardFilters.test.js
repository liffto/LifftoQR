import { describe, it, expect } from 'vitest'
import {
  filterRecords,
  filtersContradict,
  isNarrowed,
} from '../src/lib/dashboardFilters'

const dynamic = (over = {}) => ({
  name: 'Dynamic code',
  url: 'https://liffto.com',
  slug: 'TBkMfr',
  qrType: 'Dynamic QR',
  dynamic: true,
  status: 'Active',
  ...over,
})

const staticCode = (over = {}) => ({
  name: 'Wi-Fi: VEDANS',
  url: '',
  slug: 'wifi01',
  qrType: 'Static QR',
  dynamic: false,
  status: 'Active',
  ...over,
})

const labels = (rows) => rows.map((r) => r.name)

describe('filtering the dashboard list', () => {
  const list = [
    dynamic({ name: 'Active link' }),
    dynamic({ name: 'Paused link', status: 'Inactive' }),
    staticCode({ name: 'Wi-Fi: VEDANS' }),
    staticCode({ name: 'My contact card', qrType: 'Statistic' }),
  ]

  it('returns everything with nothing chosen', () => {
    expect(filterRecords(list)).toHaveLength(4)
  })

  it('narrows to active codes', () => {
    expect(labels(filterRecords(list, { status: 'Active' }))).toEqual([
      'Active link',
    ])
  })

  it('narrows to inactive codes', () => {
    expect(labels(filterRecords(list, { status: 'Inactive' }))).toEqual([
      'Paused link',
    ])
  })

  it('leaves static codes out of a status filter entirely', () => {
    // A static code carries its content in the pattern — there is no redirect
    // to switch off — so it has no status to be filtered on, even though the
    // record still holds a status column that would answer "Active".
    const onlyStatics = [staticCode(), staticCode({ name: 'Another' })]
    expect(filterRecords(onlyStatics, { status: 'Active' })).toEqual([])
    expect(filterRecords(onlyStatics, { status: 'Inactive' })).toEqual([])
    expect(filterRecords(onlyStatics, { status: 'Any status' })).toHaveLength(2)
  })

  it('treats the legacy "Statistic" label as static', () => {
    const legacy = [staticCode({ name: 'Legacy', qrType: 'Statistic' })]
    expect(filterRecords(legacy, { type: 'Static QR' })).toHaveLength(1)
    expect(filterRecords(legacy, { status: 'Active' })).toEqual([])
  })

  it('reads a bare boolean status the way the list pill does', () => {
    const rows = [
      dynamic({ name: 'Off', status: false }),
      dynamic({ name: 'On', status: true }),
    ]
    expect(labels(filterRecords(rows, { status: 'Inactive' }))).toEqual(['Off'])
    expect(labels(filterRecords(rows, { status: 'Active' }))).toEqual(['On'])
  })

  it('combines the search box with both filters', () => {
    expect(
      labels(filterRecords(list, { query: 'paused', status: 'Inactive' })),
    ).toEqual(['Paused link'])
    expect(
      filterRecords(list, { query: 'paused', status: 'Active' }),
    ).toEqual([])
  })

  it('searches name, url and slug', () => {
    expect(labels(filterRecords(list, { query: 'TBkMfr' }))).toContain(
      'Active link',
    )
    expect(labels(filterRecords(list, { query: 'liffto.com' }))).toContain(
      'Active link',
    )
    expect(labels(filterRecords(list, { query: 'VEDANS' }))).toEqual([
      'Wi-Fi: VEDANS',
    ])
  })

  it('ignores surrounding whitespace and case in the query', () => {
    expect(labels(filterRecords(list, { query: '  vedans  ' }))).toEqual([
      'Wi-Fi: VEDANS',
    ])
  })

  it('survives records missing the fields it searches', () => {
    const sparse = [{ qrType: 'Static QR' }]
    expect(() => filterRecords(sparse, { query: 'x' })).not.toThrow()
    expect(filterRecords(sparse, { query: 'x' })).toEqual([])
  })
})

describe('filter combinations that cannot match', () => {
  it('flags static combined with a status', () => {
    expect(
      filtersContradict({ type: 'Static QR', status: 'Active' }),
    ).toBe(true)
    expect(
      filtersContradict({ type: 'Static QR', status: 'Inactive' }),
    ).toBe(true)
  })

  it('does not flag combinations that can match', () => {
    expect(
      filtersContradict({ type: 'Static QR', status: 'Any status' }),
    ).toBe(false)
    expect(filtersContradict({ type: 'All', status: 'Active' })).toBe(false)
    expect(
      filtersContradict({ type: 'Dynamic QR', status: 'Inactive' }),
    ).toBe(false)
  })
})

describe('knowing whether the list has been narrowed', () => {
  it('is false only when nothing is set', () => {
    expect(isNarrowed({})).toBe(false)
    expect(isNarrowed({ query: '   ', type: 'All', status: 'Any status' })).toBe(
      false,
    )
  })

  it('is true for a query, a type, or a status', () => {
    expect(isNarrowed({ query: 'x' })).toBe(true)
    expect(isNarrowed({ type: 'Dynamic QR' })).toBe(true)
    expect(isNarrowed({ status: 'Inactive' })).toBe(true)
  })
})
