// Coarse relative time and day bucketing for lists. Deliberately small — the
// UI only needs "3 days ago" and a today/yesterday/earlier heading, which is
// not worth a date library.

export function timeAgo(iso) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return ''
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000))
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

/** 'today' | 'yesterday' | 'earlier', compared in the viewer's own timezone. */
export function dayBucket(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return 'earlier'
  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  if (d >= startOfToday) return 'today'
  const startOfYesterday = new Date(startOfToday)
  startOfYesterday.setDate(startOfYesterday.getDate() - 1)
  if (d >= startOfYesterday) return 'yesterday'
  return 'earlier'
}
