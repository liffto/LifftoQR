// Narrowing the dashboard list: the search box, the type pills, and the status
// pills. Kept here rather than inline so it can be tested — the dashboard is
// behind sign-in, so a unit test is the only way to check what a given set of
// records would show.

export const TYPE_FILTERS = ['All', 'Dynamic QR', 'Static QR']
export const STATUS_FILTERS = ['Any status', 'Active', 'Inactive']

const normaliseType = (t) => (t === 'Statistic' ? 'Static QR' : t)

export const isDynamicRecord = (row) =>
  Boolean(row?.dynamic) || normaliseType(row?.qrType) === 'Dynamic QR'

// Anything not explicitly inactive reads as active, matching the pill in the
// list. The API sends the string; older records have carried a bare boolean.
export const isInactiveRecord = (row) =>
  row?.status === 'Inactive' ||
  row?.status === false ||
  row?.status === 0 ||
  row?.status === 'false'

// Active and Inactive are properties of a redirect, and a static code has no
// redirect to enable or disable — it carries its content in the pattern, so
// there is nothing to turn off short of reprinting it. The list already
// reflects that by showing no status on a static row.
//
// The records still carry a status column whatever their type, so a static code
// would quietly answer "Active" and be swept into that filter, offering a state
// the list never showed it in and implying it could be switched off. Choosing a
// status therefore narrows to the codes the status can describe.
export const statusAppliesTo = isDynamicRecord

const matchesQuery = (row, q) =>
  !q ||
  (row.name || '').toLowerCase().includes(q) ||
  (row.url || '').toLowerCase().includes(q) ||
  (row.slug || '').toLowerCase().includes(q)

const matchesType = (row, type) =>
  type === 'All' || normaliseType(row.qrType) === type

const matchesStatus = (row, status) => {
  if (status === 'Any status') return true
  if (!statusAppliesTo(row)) return false
  return status === 'Inactive' ? isInactiveRecord(row) : !isInactiveRecord(row)
}

export function filterRecords(
  list = [],
  { query = '', type = 'All', status = 'Any status' } = {},
) {
  const q = query.trim().toLowerCase()
  return list.filter(
    (row) =>
      matchesQuery(row, q) && matchesType(row, type) && matchesStatus(row, status),
  )
}

// True when the chosen filters cannot match anything by construction, so the
// empty state can say why instead of suggesting the search term is at fault.
export const filtersContradict = ({ type, status }) =>
  type === 'Static QR' && status !== 'Any status'

export const isNarrowed = ({ query = '', type = 'All', status = 'Any status' }) =>
  Boolean(query.trim()) || type !== 'All' || status !== 'Any status'
