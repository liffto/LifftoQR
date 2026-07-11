import { Plus, X, ChevronDown, ImagePlus } from 'lucide-react'
import { compressImageFile } from '../lib/imageCompress'

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

export const INPUT_CLS =
  'h-11 w-full rounded-[10px] border border-line bg-white px-3.5 text-sm text-ink outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/10 placeholder:text-ink-faint'

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

function Field({ field, value, onChange }) {
  const { key, label, inputType, placeholder, required, options } = field
  const id = `f-${key}`
  const common = {
    id,
    value: value ?? '',
    onChange: (e) => onChange(key, e.target.value),
  }

  if (inputType === 'linklist')
    return <LinkListField field={field} value={value} onChange={onChange} />
  if (inputType === 'image')
    return <ImageField field={field} value={value} onChange={onChange} />

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
            INPUT_CLS.replace('h-11', 'min-h-[76px] py-2.5') +
            ' resize-y leading-relaxed'
          }
        />
      ) : inputType === 'select' ? (
        <div className="relative">
          <select
            {...common}
            className={INPUT_CLS + ' appearance-none cursor-pointer pr-10'}
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
      ) : (
        <input
          {...common}
          type={inputType}
          placeholder={placeholder}
          className={INPUT_CLS}
        />
      )}
    </div>
  )
}

// Renders all of a type's input fields in a 2-col grid.
// onChange(fieldKey, value) is called per field.
export default function TypeFields({
  type,
  content = {},
  onChange,
  className = '',
}) {
  return (
    <div className={`grid grid-cols-2 gap-x-3 gap-y-4 ${className}`}>
      {type.fields.map((f) => (
        <Field
          key={f.key}
          field={f}
          value={content[f.key]}
          onChange={onChange}
        />
      ))}
    </div>
  )
}
