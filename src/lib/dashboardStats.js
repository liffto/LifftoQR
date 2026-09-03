// The figures on the dashboard's summary bar, derived from the QR codes the
// account actually holds.
//
// Pulled out of Dashboard.jsx to be testable. The dashboard sits behind
// sign-in, so this is the only way to check these read correctly for a given
// account without one — and they were wrong for a long time, which is reason
// enough to pin them down.
//
// Two of these subtitles were the fixed strings '+2 this week' and
// '+18% vs last week', shown in the growth colour with an upward arrow whatever
// the account contained: an account holding a single code claimed "+2 this
// week", and one that had never been scanned once claimed "+18%".
//
// Neither figure can honestly be produced from what is stored. qrs.scans is a
// single running integer with no history behind it, so nothing records what it
// read last week; and qrs.created_at exists on the table but is not carried on
// any of the item responses, so "this week" has no date to compare against.
// Both are fixable in the API. Until they are, these say something true.

const normaliseType = (t) => (t === 'Statistic' ? 'Static QR' : t)

const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`

// "since 4 Sept" — short, because it sits under a number in a small tile.
export function trackingSince(iso) {
  if (!iso) return null
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return null
  return `since ${d.getDate()} ${d.toLocaleString('en-GB', { month: 'short' })}`
}

export function dashboardStats(list = []) {
  const total = list.length
  const totalScans = list.reduce((sum, r) => sum + (r.scans || 0), 0)
  // Per code, then summed — the direct counterpart to Total Scans, and what
  // the per-row unique figures add up to. Deliberately not a distinct count of
  // devices across the whole account: one person scanning three different
  // codes is three codes reaching someone, which is the useful reading here.
  const uniqueScans = list.reduce((sum, r) => sum + (r.uniqueScans || 0), 0)
  const dynamicCount = list.filter(
    (r) => normaliseType(r.qrType) === 'Dynamic QR',
  ).length
  // Anything not explicitly inactive reads as active, matching the status pill
  // in the table — the API sends the string, but older records have carried a
  // bare boolean.
  const activeCount = list.filter(
    (r) => !(r.status === 'Inactive' || r.status === false),
  ).length
  const scannedCount = list.filter((r) => (r.scans || 0) > 0).length

  return {
    total,
    totalScans,
    uniqueScans,
    dynamicCount,
    activeCount,
    scannedCount,
    codesSub: total === 0 ? 'none yet' : `${activeCount} active`,
    scansSub:
      totalScans === 0 ? 'no scans yet' : `across ${plural(scannedCount, 'code')}`,
  }
}
