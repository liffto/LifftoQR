// Country dial codes + the national-number lengths each country actually uses.
//
// `lengths` is the set of valid *national significant number* lengths (the
// digits after the country code, with any trunk "0" dropped). It covers both
// mobile and landline, which differ per country — e.g. India is always 10,
// Singapore 8, while Germany and Indonesia accept a wide range. Validation
// checks membership in this set rather than a single hardcoded length.

export const COUNTRIES = [
  { iso: 'AR', name: 'Argentina', dial: '54', flag: '🇦🇷', lengths: [10] },
  { iso: 'AU', name: 'Australia', dial: '61', flag: '🇦🇺', lengths: [9] },
  { iso: 'AT', name: 'Austria', dial: '43', flag: '🇦🇹', lengths: [9, 10, 11] },
  { iso: 'BH', name: 'Bahrain', dial: '973', flag: '🇧🇭', lengths: [8] },
  { iso: 'BD', name: 'Bangladesh', dial: '880', flag: '🇧🇩', lengths: [10] },
  { iso: 'BE', name: 'Belgium', dial: '32', flag: '🇧🇪', lengths: [8, 9] },
  { iso: 'BR', name: 'Brazil', dial: '55', flag: '🇧🇷', lengths: [10, 11] },
  { iso: 'CA', name: 'Canada', dial: '1', flag: '🇨🇦', lengths: [10] },
  { iso: 'CN', name: 'China', dial: '86', flag: '🇨🇳', lengths: [10, 11] },
  { iso: 'DK', name: 'Denmark', dial: '45', flag: '🇩🇰', lengths: [8] },
  { iso: 'EG', name: 'Egypt', dial: '20', flag: '🇪🇬', lengths: [9, 10] },
  { iso: 'FI', name: 'Finland', dial: '358', flag: '🇫🇮', lengths: [9, 10] },
  { iso: 'FR', name: 'France', dial: '33', flag: '🇫🇷', lengths: [9] },
  {
    iso: 'DE',
    name: 'Germany',
    dial: '49',
    flag: '🇩🇪',
    lengths: [7, 8, 9, 10, 11],
  },
  { iso: 'GR', name: 'Greece', dial: '30', flag: '🇬🇷', lengths: [10] },
  { iso: 'HK', name: 'Hong Kong', dial: '852', flag: '🇭🇰', lengths: [8] },
  { iso: 'IN', name: 'India', dial: '91', flag: '🇮🇳', lengths: [10] },
  {
    iso: 'ID',
    name: 'Indonesia',
    dial: '62',
    flag: '🇮🇩',
    lengths: [9, 10, 11, 12],
  },
  { iso: 'IE', name: 'Ireland', dial: '353', flag: '🇮🇪', lengths: [9] },
  { iso: 'IL', name: 'Israel', dial: '972', flag: '🇮🇱', lengths: [9] },
  { iso: 'IT', name: 'Italy', dial: '39', flag: '🇮🇹', lengths: [9, 10, 11] },
  { iso: 'JP', name: 'Japan', dial: '81', flag: '🇯🇵', lengths: [9, 10] },
  { iso: 'KE', name: 'Kenya', dial: '254', flag: '🇰🇪', lengths: [9] },
  { iso: 'KW', name: 'Kuwait', dial: '965', flag: '🇰🇼', lengths: [8] },
  { iso: 'MY', name: 'Malaysia', dial: '60', flag: '🇲🇾', lengths: [9, 10] },
  { iso: 'MX', name: 'Mexico', dial: '52', flag: '🇲🇽', lengths: [10] },
  { iso: 'NP', name: 'Nepal', dial: '977', flag: '🇳🇵', lengths: [10] },
  { iso: 'NL', name: 'Netherlands', dial: '31', flag: '🇳🇱', lengths: [9] },
  { iso: 'NZ', name: 'New Zealand', dial: '64', flag: '🇳🇿', lengths: [8, 9] },
  { iso: 'NG', name: 'Nigeria', dial: '234', flag: '🇳🇬', lengths: [10] },
  { iso: 'NO', name: 'Norway', dial: '47', flag: '🇳🇴', lengths: [8] },
  { iso: 'OM', name: 'Oman', dial: '968', flag: '🇴🇲', lengths: [8] },
  { iso: 'PK', name: 'Pakistan', dial: '92', flag: '🇵🇰', lengths: [10] },
  { iso: 'PH', name: 'Philippines', dial: '63', flag: '🇵🇭', lengths: [10] },
  { iso: 'PL', name: 'Poland', dial: '48', flag: '🇵🇱', lengths: [9] },
  { iso: 'PT', name: 'Portugal', dial: '351', flag: '🇵🇹', lengths: [9] },
  { iso: 'QA', name: 'Qatar', dial: '974', flag: '🇶🇦', lengths: [8] },
  { iso: 'RU', name: 'Russia', dial: '7', flag: '🇷🇺', lengths: [10] },
  { iso: 'SA', name: 'Saudi Arabia', dial: '966', flag: '🇸🇦', lengths: [9] },
  { iso: 'SG', name: 'Singapore', dial: '65', flag: '🇸🇬', lengths: [8] },
  { iso: 'ZA', name: 'South Africa', dial: '27', flag: '🇿🇦', lengths: [9] },
  { iso: 'KR', name: 'South Korea', dial: '82', flag: '🇰🇷', lengths: [9, 10] },
  { iso: 'ES', name: 'Spain', dial: '34', flag: '🇪🇸', lengths: [9] },
  { iso: 'LK', name: 'Sri Lanka', dial: '94', flag: '🇱🇰', lengths: [9] },
  { iso: 'SE', name: 'Sweden', dial: '46', flag: '🇸🇪', lengths: [7, 8, 9] },
  { iso: 'CH', name: 'Switzerland', dial: '41', flag: '🇨🇭', lengths: [9] },
  { iso: 'TH', name: 'Thailand', dial: '66', flag: '🇹🇭', lengths: [9] },
  { iso: 'TR', name: 'Turkey', dial: '90', flag: '🇹🇷', lengths: [10] },
  {
    iso: 'AE',
    name: 'United Arab Emirates',
    dial: '971',
    flag: '🇦🇪',
    lengths: [9],
  },
  {
    iso: 'GB',
    name: 'United Kingdom',
    dial: '44',
    flag: '🇬🇧',
    lengths: [9, 10],
  },
  {
    iso: 'US',
    name: 'United States',
    dial: '1',
    flag: '🇺🇸',
    lengths: [10],
    primary: true,
  },
  { iso: 'VN', name: 'Vietnam', dial: '84', flag: '🇻🇳', lengths: [9] },
]

export const DEFAULT_COUNTRY_ISO = 'IN'

const BY_ISO = Object.fromEntries(COUNTRIES.map((c) => [c.iso, c]))

// Dial codes are ambiguous by prefix (+9 vs +91 vs +971), so match longest-first.
// Where several countries share one code (US/CA on +1) the `primary` flag decides
// which the dropdown pre-selects; the number itself is identical either way.
const BY_DIAL_DESC = [...COUNTRIES].sort(
  (a, b) =>
    b.dial.length - a.dial.length ||
    Number(Boolean(b.primary)) - Number(Boolean(a.primary)),
)

export const findCountry = (iso) => BY_ISO[iso] || BY_ISO[DEFAULT_COUNTRY_ISO]

/** Look a country up by its dial code ("91"), for schemas that store the two parts separately. */
export const findByDial = (dial) => {
  const d = digitsOnly(dial)
  return COUNTRIES.find((c) => c.dial === d) || null
}

export const digitsOnly = (v) => String(v ?? '').replace(/\D/g, '')

/** Split a stored E.164 string into its country + national parts. */
export function splitPhone(value) {
  const raw = String(value ?? '').trim()
  const digits = digitsOnly(raw)
  if (!digits) return { iso: DEFAULT_COUNTRY_ISO, national: '' }

  // Only trust a dial-code prefix when the value was actually written in
  // international form; a bare "9876543210" is a national number, not +98…
  if (raw.startsWith('+')) {
    const match = BY_DIAL_DESC.find((c) => digits.startsWith(c.dial))
    if (match) {
      return { iso: match.iso, national: digits.slice(match.dial.length) }
    }
  }
  return { iso: DEFAULT_COUNTRY_ISO, national: digits }
}

/** Build the stored E.164 string. Empty national number stores nothing. */
export function joinPhone(iso, national) {
  const nat = digitsOnly(national)
  if (!nat) return ''
  return '+' + findCountry(iso).dial + nat
}

export const maxLengthFor = (iso) => Math.max(...findCountry(iso).lengths)

/** Human hint for the accepted digit count(s), e.g. "10 digits" or "9 or 10 digits". */
export function lengthHint(iso) {
  const { lengths } = findCountry(iso)
  const sorted = [...lengths].sort((a, b) => a - b)
  if (sorted.length === 1) return `${sorted[0]} digits`
  // A long contiguous run reads better as a range than a list.
  const isRange = sorted[sorted.length - 1] - sorted[0] === sorted.length - 1
  if (isRange && sorted.length > 2) {
    return `${sorted[0]}–${sorted[sorted.length - 1]} digits`
  }
  return `${sorted.slice(0, -1).join(', ')} or ${sorted[sorted.length - 1]} digits`
}

/** True when the national part matches one of the country's valid lengths. */
export function isValidNationalNumber(iso, national) {
  const nat = digitsOnly(national)
  return findCountry(iso).lengths.includes(nat.length)
}

/** Validate a stored E.164 value. Empty is treated as valid (use `required` for presence). */
export function isValidPhone(value) {
  const v = String(value ?? '').trim()
  if (!v) return true
  const { iso, national } = splitPhone(v)
  return isValidNationalNumber(iso, national)
}
