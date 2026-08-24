import { useState } from 'react'
import { Plus, X, ChevronDown, ImagePlus, Eye, EyeOff } from 'lucide-react'
import { compressImageFile } from '../lib/imageCompress'
import {
  COUNTRIES,
  digitsOnly,
  findByDial,
  findCountry,
  isValidNationalNumber,
  lengthHint,
  maxLengthFor,
} from '../lib/countries'
import PhoneInput from './PhoneInput'
import { INPUT_CLS } from './formStyles'
import { advanceOnEnter } from '../lib/enterToAdvance'

// Pretty option labels for selects (values stay raw so encoders keep working).
const OPTION_LABELS = {
  false: 'No',
  true: 'Yes',
  nopass: 'No password',
  WPA: 'WPA/WPA2',
  WEP: 'WEP',
  instagram: 'Instagram',
  x: 'X (Twitter)',
  facebook: 'Facebook',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  youtube: 'YouTube',
  snapchat: 'Snapchat',
  pinterest: 'Pinterest',
  threads: 'Threads',
  github: 'GitHub',
  whatsapp: 'WhatsApp',
  telegram: 'Telegram',
  other: 'Other',
}
const optLabel = (o) =>
  OPTION_LABELS[o] || o.charAt(0).toUpperCase() + o.slice(1)

export { INPUT_CLS }

// Swap the neutral border for the danger one rather than appending it.
// Tailwind decides between two competing border utilities by their order in
// the generated stylesheet, not their order in the class string, so
// `... border-line ... border-danger` silently keeps the grey — confirmed in
// the browser before this was written.
const asInvalid = (cls) =>
  cls
    .replace('border-line', 'border-danger')
    .replace('focus:border-primary', 'focus:border-danger')
    .replace('focus:ring-primary/10', 'focus:ring-danger/10')

// Repeatable list of {label, url} rows (Link Tree)
function LinkListField({ field, value, onChange }) {
  const rows = Array.isArray(value) ? value : []
  const setRow = (i, patch) =>
    onChange(
      field.key,
      rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r)),
    )
  const addRow = () => onChange(field.key, [...rows, { label: '', url: '' }])
  const removeRow = (i) =>
    onChange(
      field.key,
      rows.filter((_, idx) => idx !== i),
    )

  return (
    <div className="col-span-2">
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>
      <div className="space-y-2.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="w-6 h-6 shrink-0 rounded-[10px] bg-canvas text-ink-faint text-xs font-bold flex items-center justify-center">
              {i + 1}
            </span>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-[160px_1fr] gap-2">
              <input
                value={r.label || ''}
                onChange={(e) => setRow(i, { label: e.target.value })}
                placeholder="Title (e.g. Instagram)"
                className={INPUT_CLS}
              />
              <input
                value={r.url || ''}
                onChange={(e) => setRow(i, { url: e.target.value })}
                placeholder="https://…"
                className={INPUT_CLS}
              />
            </div>
            <button
              type="button"
              onClick={() => removeRow(i)}
              disabled={rows.length <= 1}
              aria-label="Remove link"
              className="h-11 w-9 shrink-0 rounded-[10px] border border-line text-ink-faint flex items-center justify-center hover:border-danger hover:text-danger hover:bg-red-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        onClick={addRow}
        className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
      >
        <Plus size={15} /> Add link
      </button>
    </div>
  )
}

// Image upload → stored as a compressed data URL in content[key]
function ImageField({ field, value, onChange }) {
  const onFile = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await compressImageFile(file)
      onChange(field.key, dataUrl)
    } catch {
      // Keep existing value if compression fails
    }
  }
  const round = field.shape === 'circle' ? 'rounded-full' : 'rounded-[10px]'
  return (
    <div className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <label className="mb-1.5 block text-xs font-medium text-ink-muted">
        {field.label}
      </label>
      <div className="flex items-center gap-3">
        <label
          className={`relative flex h-14 w-14 shrink-0 cursor-pointer items-center justify-center overflow-hidden border ${round} ${
            value
              ? 'border-line'
              : 'border-dashed border-line text-ink-faint hover:border-primary hover:text-primary'
          }`}
        >
          {value ? (
            <img src={value} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={18} />
          )}
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onFile}
          />
        </label>
        {value ? (
          <button
            type="button"
            onClick={() => onChange(field.key, '')}
            className="text-xs font-medium text-danger hover:underline"
          >
            Remove
          </button>
        ) : (
          <label className="cursor-pointer text-xs font-medium text-primary hover:underline">
            Upload
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFile}
            />
          </label>
        )}
      </div>
    </div>
  )
}

// Country picker + national number, stored as a single E.164 string ("+9198…").
// The accepted digit count comes from the selected country, so India requires
// exactly 10 while Singapore requires 8 and Germany accepts a range.
function PhoneField({ field, value, onChange }) {
  const id = `f-${field.key}`
  return (
    <div className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-ink-muted"
      >
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>
      <PhoneInput
        id={id}
        value={value}
        onChange={(next) => onChange(field.key, next)}
      />
    </div>
  )
}

// WhatsApp stores the dial code and the number in separate columns, so those
// two get their own fields instead of the combined PhoneField above.
function DialCodeField({ field, value, onChange }) {
  const selected = findByDial(value)
  const id = `f-${field.key}`
  return (
    <div className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-ink-muted"
      >
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>
      <div className="relative">
        <select
          id={id}
          value={selected ? selected.iso : ''}
          onChange={(e) => onChange(field.key, findCountry(e.target.value).dial)}
          className={INPUT_CLS + ' appearance-none cursor-pointer pr-10'}
        >
          {!selected && <option value="">Select a country</option>}
          {COUNTRIES.map((c) => (
            <option key={c.iso} value={c.iso}>
              {c.flag} {c.name} (+{c.dial})
            </option>
          ))}
        </select>
        <ChevronDown
          size={16}
          className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
        />
      </div>
    </div>
  )
}

// National number whose valid length is driven by a sibling dial-code field.
function NationalNumberField({ field, value, onChange, content }) {
  const [touched, setTouched] = useState(false)
  const country = findByDial(content?.[field.dialFrom])
  const digits = digitsOnly(value)
  const id = `f-${field.key}`
  const invalid =
    touched &&
    digits !== '' &&
    country != null &&
    !isValidNationalNumber(country.iso, digits)

  return (
    <div className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-ink-muted"
      >
        {field.label}
        {field.required && <span className="text-danger"> *</span>}
      </label>
      <input
        id={id}
        type="tel"
        inputMode="numeric"
        value={digits}
        onChange={(e) =>
          onChange(
            field.key,
            country
              ? digitsOnly(e.target.value).slice(0, maxLengthFor(country.iso))
              : digitsOnly(e.target.value),
          )
        }
        onBlur={() => setTouched(true)}
        placeholder={country ? '0'.repeat(maxLengthFor(country.iso)) : field.placeholder}
        className={invalid ? asInvalid(INPUT_CLS) : INPUT_CLS}
      />
      {country && (
        <p
          className={`mt-1 text-[11px] ${invalid ? 'text-danger' : 'text-ink-faint'}`}
        >
          {invalid
            ? `${country.name} numbers are ${lengthHint(country.iso)}`
            : lengthHint(country.iso)}
        </p>
      )}
    </div>
  )
}

// The "Website URL" QR type's own url field only — not every field that
// happens to accept a link (vCard website, PDF/video links, …), since those
// can be legitimately case-sensitive (e.g. a YouTube video id).
function isWebsiteUrlField(typeKey, field) {
  return typeKey === 'url' && field.key === 'url'
}

function Field({ field, value, onChange, typeKey, content, isMissing = false }) {
  const { key, label, inputType, placeholder, required, options } = field
  const id = `f-${key}`
  const lowercaseOnType = isWebsiteUrlField(typeKey, field)
  const [passwordVisible, setPasswordVisible] = useState(false)
  // data-incomplete is what the page's "what's missing" handler looks for to
  // scroll to and focus the first one, so it goes on the control itself.
  const common = {
    id,
    value: value ?? '',
    'data-incomplete': isMissing ? 'true' : undefined,
    'aria-invalid': isMissing || undefined,
    onChange: (e) =>
      onChange(key, lowercaseOnType ? e.target.value.toLowerCase() : e.target.value),
  }
  const mark = (cls) => (isMissing ? asInvalid(cls) : cls)

  if (inputType === 'linklist')
    return <LinkListField field={field} value={value} onChange={onChange} />
  if (inputType === 'image')
    return <ImageField field={field} value={value} onChange={onChange} />
  if (inputType === 'phone')
    return <PhoneField field={field} value={value} onChange={onChange} />
  if (inputType === 'dialcode')
    return <DialCodeField field={field} value={value} onChange={onChange} />
  if (inputType === 'national')
    return (
      <NationalNumberField
        field={field}
        value={value}
        onChange={onChange}
        content={content}
      />
    )

  return (
    <div className={field.half ? 'col-span-2 sm:col-span-1' : 'col-span-2'}>
      <label
        htmlFor={id}
        className="mb-1.5 block text-xs font-medium text-ink-muted"
      >
        {label}
        {required && <span className="text-danger"> *</span>}
      </label>
      {inputType === 'textarea' ? (
        <textarea
          {...common}
          rows={3}
          placeholder={placeholder}
          className={
            mark(INPUT_CLS.replace('h-11', 'min-h-[76px] py-2.5')) +
            ' resize-y leading-relaxed'
          }
        />
      ) : inputType === 'select' ? (
        <div className="relative">
          <select
            {...common}
            className={
              mark(INPUT_CLS) + ' appearance-none cursor-pointer pr-10'
            }
          >
            {options.map((o) => (
              <option key={o} value={o}>
                {optLabel(o)}
              </option>
            ))}
          </select>
          <ChevronDown
            size={16}
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint"
          />
        </div>
      ) : inputType === 'password' ? (
        <div className="relative">
          <input
            {...common}
            type={passwordVisible ? 'text' : 'password'}
            placeholder={placeholder}
            className={mark(INPUT_CLS) + ' pr-10'}
          />
          <button
            type="button"
            onClick={() => setPasswordVisible((v) => !v)}
            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-primary transition-colors"
          >
            {passwordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      ) : (
        <input
          {...common}
          type={inputType}
          placeholder={placeholder}
          autoCapitalize={lowercaseOnType ? 'none' : undefined}
          spellCheck={lowercaseOnType ? false : undefined}
          className={mark(INPUT_CLS)}
        />
      )}
    </div>
  )
}

// Renders all of a type's input fields in a 2-col grid.
// onChange(fieldKey, value) is called per field.
// onComplete, if given, runs when Enter is pressed in the last field.
// missing lists the required field keys still to fill — the host passes it
// only after someone has tried to submit, so an untouched form is never red.
export default function TypeFields({
  type,
  content = {},
  onChange,
  onComplete,
  missing = [],
  className = '',
}) {
  return (
    <div
      onKeyDown={(e) => advanceOnEnter(e, { onLast: onComplete })}
      className={`grid grid-cols-2 gap-x-3 gap-y-4 ${className}`}
    >
      {type.fields.map((f) => (
        <Field
          key={f.key}
          field={f}
          value={content[f.key]}
          onChange={onChange}
          typeKey={type.key}
          content={content}
          isMissing={missing.includes(f.key)}
        />
      ))}
    </div>
  )
}
