import { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import {
  COUNTRIES,
  findCountry,
  splitPhone,
  joinPhone,
  digitsOnly,
  maxLengthFor,
  lengthHint,
  isValidNationalNumber,
} from '../lib/countries'
import { INPUT_CLS } from './formStyles'

// Country picker + national number, stored as a single E.164 string. Shared by
// the QR type fields and the account profile form so the country list, digit
// limits and validation only exist once.
export default function PhoneInput({ id, value, onChange, className = '' }) {
  const { national } = splitPhone(value)
  const [iso, setIso] = useState(() => splitPhone(value).iso)
  const [touched, setTouched] = useState(false)

  // A saved record loading from the API carries its country inside the value —
  // adopt it. Compared by dial code so countries that share one (US/Canada on
  // +1) don't yank the dropdown away from the user's pick.
  useEffect(() => {
    const next = splitPhone(value)
    if (next.national && findCountry(next.iso).dial !== findCountry(iso).dial) {
      setIso(next.iso)
    }
  }, [value, iso])

  const setCountry = (nextIso) => {
    setIso(nextIso)
    onChange(joinPhone(nextIso, national))
  }
  const setNumber = (raw) =>
    onChange(joinPhone(iso, digitsOnly(raw).slice(0, maxLengthFor(iso))))

  const invalid =
    touched && national !== '' && !isValidNationalNumber(iso, national)

  return (
    <div className={className}>
      <div className="flex gap-2">
        <div className="relative shrink-0">
          <select
            aria-label="Country code"
            value={iso}
            onChange={(e) => setCountry(e.target.value)}
            className={
              INPUT_CLS + ' w-[116px] appearance-none cursor-pointer pr-8'
            }
          >
            {COUNTRIES.map((c) => (
              <option key={c.iso} value={c.iso}>
                {c.flag} +{c.dial}
              </option>
            ))}
          </select>
          <ChevronDown
            size={14}
            className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-faint"
          />
        </div>
        <input
          id={id}
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          value={national}
          onChange={(e) => setNumber(e.target.value)}
          onBlur={() => setTouched(true)}
          placeholder={'0'.repeat(maxLengthFor(iso))}
          className={
            INPUT_CLS +
            (invalid
              ? ' border-danger focus:border-danger focus:ring-danger/10'
              : '')
          }
        />
      </div>
      <p
        className={`mt-1 text-[11px] ${invalid ? 'text-danger' : 'text-ink-faint'}`}
      >
        {invalid
          ? `${findCountry(iso).name} numbers are ${lengthHint(iso)}`
          : lengthHint(iso)}
      </p>
    </div>
  )
}
