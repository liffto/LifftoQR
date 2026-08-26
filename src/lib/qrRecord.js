// Small predicates about a saved QR record, shared by the pages that need to
// reason about one. Kept apart from the dashboard's filtering so anything can
// ask these questions without pulling in filter machinery.

const normaliseType = (t) => (t === 'Statistic' ? 'Static QR' : t)

// Dynamic codes encode a short link we host and redirect from. Static codes
// encode their content directly into the pattern — there is no redirect, which
// is why a static code has no destination to open, no scans to count and no
// status to switch.
export const isDynamicRecord = (row) =>
  Boolean(row?.dynamic) || normaliseType(row?.qrType) === 'Dynamic QR'

// Anything not explicitly inactive reads as active, matching the pill in the
// list. The API sends the string; older records have carried a bare boolean.
export const isInactiveRecord = (row) =>
  row?.status === 'Inactive' ||
  row?.status === false ||
  row?.status === 0 ||
  row?.status === 'false'
