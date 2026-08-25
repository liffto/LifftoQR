import { describe, it, expect } from 'vitest'
import { dashboardStats } from '../src/lib/dashboardStats'

const code = (over = {}) => ({
  qrType: 'Static QR',
  status: 'Active',
  scans: 0,
  ...over,
})

describe('dashboard summary figures', () => {
  it('says nothing has happened yet on an empty account', () => {
    const s = dashboardStats([])
    expect(s.total).toBe(0)
    expect(s.codesSub).toBe('none yet')
    expect(s.scansSub).toBe('no scans yet')
  })

  it('does not claim growth for an account holding one unscanned code', () => {
    // The exact account that used to report "+2 this week" above a total of 1,
    // and "+18% vs last week" above zero scans.
    const s = dashboardStats([code()])
    expect(s.total).toBe(1)
    expect(s.codesSub).toBe('1 active')
    expect(s.scansSub).toBe('no scans yet')
  })

  it('never reports a figure larger than the account holds', () => {
    for (const list of [[], [code()], [code(), code()]]) {
      const s = dashboardStats(list)
      expect(s.activeCount).toBeLessThanOrEqual(s.total)
      expect(s.scannedCount).toBeLessThanOrEqual(s.total)
      expect(s.dynamicCount).toBeLessThanOrEqual(s.total)
    }
  })

  it('counts scans across the codes that actually have them', () => {
    const s = dashboardStats([
      code({ scans: 12 }),
      code({ scans: 3 }),
      code({ scans: 0 }),
    ])
    expect(s.totalScans).toBe(15)
    expect(s.scannedCount).toBe(2)
    expect(s.scansSub).toBe('across 2 codes')
  })

  it('keeps the count singular for a single scanned code', () => {
    const s = dashboardStats([code({ scans: 4 }), code({ scans: 0 })])
    expect(s.scansSub).toBe('across 1 code')
  })

  it('excludes inactive codes from the active count but not the total', () => {
    const s = dashboardStats([
      code(),
      code({ status: 'Inactive' }),
      // Older records have carried a bare boolean rather than the string.
      code({ status: false }),
    ])
    expect(s.total).toBe(3)
    expect(s.activeCount).toBe(1)
    expect(s.codesSub).toBe('1 active')
  })

  it('treats the legacy "Statistic" label as a static code', () => {
    const s = dashboardStats([
      code({ qrType: 'Dynamic QR' }),
      code({ qrType: 'Statistic' }),
    ])
    expect(s.dynamicCount).toBe(1)
  })

  it('tolerates a missing scan count', () => {
    const s = dashboardStats([{ qrType: 'Static QR', status: 'Active' }])
    expect(s.totalScans).toBe(0)
    expect(s.scansSub).toBe('no scans yet')
  })
})
