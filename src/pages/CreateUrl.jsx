import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Check, ChevronLeft, ArrowRight, AlertCircle } from 'lucide-react'
import {
  randomSlug,
  uid,
  todayISO,
  defaultDesign,
  setDraft,
} from '../lib/store'
import {
  QR_TYPES,
  findType,
  defaultContent,
  deriveContentName,
  encodeContent,
  isValidWebsiteUrl,
} from '../lib/qrTypes'
import Logo from '../components/Logo'
import { Toggle } from '../components/ui'
import DynamicQRInfo from '../components/DynamicQRInfo'

export default function CreateUrl() {
  const navigate = useNavigate()
  const [url, setUrl] = useState('')
  const [urlTouched, setUrlTouched] = useState(false)
  const [dynamic, setDynamic] = useState(true)
  const UrlIcon = findType('url').Icon
  const urlValid = isValidWebsiteUrl(url)
  const showUrlError = urlTouched && url.trim() !== '' && !urlValid

  const buildAndGo = (typeKey, content, dyn, target) => {
    const t = findType(typeKey)
    const eff = t.dynamicCapable && (t.requiresDynamic || dyn)
    const record = {
      id: uid(),
      typeKey,
      type: t.label,
      content,
      name: deriveContentName(typeKey, content),
      url: t.kind === 'link' ? encodeContent(typeKey, content) : '',
      slug: randomSlug(),
      dynamic: eff,
      qrType: eff ? 'Dynamic QR' : 'Static QR',
      folder: 'Untitled',
      status: 'Active',
      scans: 0,
      editedOn: todayISO(),
      design: defaultDesign(),
    }
    setDraft(record)
    navigate(target)
  }

  const startUrl = () => {
    if (!isValidWebsiteUrl(url)) return
    buildAndGo('url', { url: url.trim() }, dynamic, '/create/design')
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* TOP HEADER */}
      <header className="sticky top-0 z-20 bg-white border-b border-line h-[68px] flex items-center px-4 sm:px-6 gap-3 sm:gap-5">
        <Logo />
        <div className="h-7 w-px bg-line" />
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 text-primary font-semibold"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      </header>

      {/* PROGRESS BAR */}
      <div className="px-4 sm:px-6 pt-5">
        <div className="flex gap-2">
          <div className="h-1.5 w-16 rounded-full bg-primary" />
          <div className="h-1.5 w-16 rounded-full bg-line" />
          <div className="h-1.5 w-16 rounded-full bg-line" />
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-[1000px] mx-auto w-full px-4 sm:px-6 py-6 space-y-5">
        {/* FEATURED — Website URL quick start */}
        <div className="bg-white rounded-[10px] shadow-card">
          <div className="p-5 flex items-center gap-3 border-b border-line">
            <div className="w-11 h-11 rounded-[10px] bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <UrlIcon size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-ink">Website URL</div>
              <div className="text-xs text-ink-muted">
                Open a lin— the quickest way to start
              </div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm text-ink-muted leading-relaxed">
              Scanning this QR will{' '}
              <span className="font-medium text-ink-soft">open your link</span>.
              Paste a URL and continue, or pick another type below.
            </p>

            <div className="mt-4">
              <label className="block text-xs font-medium text-ink-muted mb-1.5">
                Website URL
              </label>
              <div className="relative">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value.toLowerCase())}
                  onBlur={() => setUrlTouched(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') startUrl()
                  }}
                  placeholder="https://example.com"
                  autoCapitalize="none"
                  spellCheck={false}
                  className={`h-12 w-full rounded-[10px] border bg-white px-4 pr-11 text-sm text-ink outline-none transition focus:ring-2 placeholder:text-ink-faint ${
                    showUrlError
                      ? 'border-danger focus:border-danger focus:ring-danger/10'
                      : 'border-line focus:border-primary focus:ring-primary/10'
                  }`}
                />
                {url.trim() &&
                  (showUrlError ? (
                    <AlertCircle
                      size={18}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-danger"
                    />
                  ) : (
                    urlValid && (
                      <Check
                        size={18}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-primary"
                      />
                    )
                  ))}
              </div>
              {showUrlError && (
                <p className="mt-1.5 text-xs text-danger">
                  Enter a valid URL, e.g. example.com
                </p>
              )}
            </div>

            <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Toggle checked={dynamic} onChange={setDynamic} />
                <span
                  onClick={() => setDynamic((v) => !v)}
                  className="text-sm font-medium text-ink-soft cursor-pointer select-none"
                >
                  Dynamic QR{' '}
                  <span className="text-ink-faint font-normal">
                    (Statistics & Editability)
                  </span>
                </span>
                <DynamicQRInfo />
              </div>
              <button
                type="button"
                onClick={startUrl}
                disabled={!urlValid}
                className="bg-primary text-white rounded-[10px] px-6 h-11 font-semibold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors whitespace-nowrap shadow-sm shadow-primary/25 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Generate QR <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* TYPE PICKER */}
        <div className="bg-white rounded-[10px] shadow-card p-5">
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-line" />
            <span className="text-xs font-medium text-ink-muted whitespace-nowrap">
              or choose a QR code type
            </span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {QR_TYPES.map((t) => {
              const Icon = t.Icon
              return (
                <button
                  key={t.key}
                  type="button"
                  onClick={() =>
                    buildAndGo(
                      t.key,
                      defaultContent(t.key),
                      t.dynamicCapable,
                      '/create/details',
                    )
                  }
                  className="flex items-center gap-2.5 rounded-[10px] border border-line p-3 text-left transition-all hover:border-primary/40 hover:bg-canvas hover:shadow-sm"
                >
                  <span
                    className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 ${t.tint}`}
                  >
                    <Icon size={17} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[13px] font-semibold text-ink truncate">
                      {t.label}
                    </span>
                    <span className="block text-[11px] text-ink-muted truncate">
                      {t.subtitle}
                    </span>
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </main>
    </div>
  )
}
