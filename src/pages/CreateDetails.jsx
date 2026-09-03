import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft, ArrowRight, Info } from 'lucide-react'
import { getDraft, setDraft, SHORT_HOST } from '../lib/store'
import {
  findType,
  isComplete,
  incompleteFields,
  deriveContentName,
  encodeContent,
  dynamicLandsOnPage,
} from '../lib/qrTypes'
import { useAuth } from '../context/AuthContext'
import { useLoginModal } from '../context/LoginModalContext'
import Logo from '../components/Logo'
import TypeFields from '../components/TypeFields'
import ScanPreview, { previewsAsQR } from '../components/ScanPreview'
import { Toggle } from '../components/ui'
import DynamicQRInfo from '../components/DynamicQRInfo'

export default function CreateDetails() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuth()
  const { openLogin } = useLoginModal()
  const [record, setRecord] = useState(() => getDraft())
  // Only after a press: marking fields red before anyone has tried to submit
  // scolds people for not having filled in a form they just opened.
  const [showMissing, setShowMissing] = useState(false)
  const [missedPresses, setMissedPresses] = useState(0)

  useEffect(() => {
    if (!getDraft()) navigate('/create', { replace: true })
  }, [navigate])

  // Runs after the render that adds data-incomplete, not during the click that
  // sets it — querying in the handler finds nothing, because React has not
  // committed yet. Counting presses rather than watching a boolean so a second
  // press re-focuses instead of doing nothing.
  useEffect(() => {
    if (!missedPresses) return
    const field = document.querySelector('[data-incomplete="true"]')
    field?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    field?.focus?.({ preventScroll: true })
  }, [missedPresses])

  if (!record) return null

  const type = findType(record.typeKey)
  const TypeIcon = type.Icon
  const complete = isComplete(record.typeKey, record.content || {})
  const missing = incompleteFields(record.typeKey, record.content || {})
  // Their own labels, not field keys — "Event Title", not "title".
  const missingLabels = missing.map(
    (key) => type.fields.find((f) => f.key === key)?.label || key,
  )
  const asQR = previewsAsQR(record.typeKey, record.dynamic)

  const setField = (k, v) =>
    setRecord((r) => {
      const t = findType(r.typeKey)
      const content = { ...(r.content || {}), [k]: v }
      const keepCustom =
        r.name && r.name !== deriveContentName(r.typeKey, r.content || {})
      const eff = t.dynamicCapable && (t.requiresDynamic || r.dynamic)
      const n = {
        ...r,
        content,
        name: keepCustom ? r.name : deriveContentName(r.typeKey, content),
        url:
          t.kind === 'link' ? encodeContent(r.typeKey, content) : r.url || '',
        dynamic: eff,
        qrType: eff ? 'Dynamic QR' : 'Static QR',
      }
      setDraft(n)
      return n
    })

  const setDynamic = (v) =>
    setRecord((r) => {
      const t = findType(r.typeKey)
      const eff = t.dynamicCapable && (t.requiresDynamic || v)
      const n = { ...r, dynamic: eff, qrType: eff ? 'Dynamic QR' : 'Static QR' }
      setDraft(n)
      return n
    })

  const handleContinue = () => {
    if (!complete) {
      // Not a dead button: say what is missing and put the cursor there. The
      // hero already works this way; a greyed-out control on a ten-field form
      // leaves people hunting for the blank one.
      setShowMissing(true)
      setMissedPresses((n) => n + 1)
      return
    }
    setDraft(record)
    // Only a dynamic code needs the account — it routes through a short link
    // we host. A static one is finished entirely in the browser.
    if (record.dynamic && !isAuthenticated) {
      openLogin('/create/design')
      return
    }
    navigate('/create/design')
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* HEADER */}
      <header className="sticky top-0 z-20 bg-white border-b border-line h-[68px] flex items-center px-4 sm:px-6 gap-3 sm:gap-5">
        <Logo />
        <div className="h-7 w-px bg-line" />
        <button
          type="button"
          onClick={() => navigate('/create')}
          className="flex items-center gap-1.5 text-primary font-semibold"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      </header>

      {/* PROGRESS */}
      <div className="px-4 sm:px-6 pt-5">
        <div className="flex gap-2">
          <div className="h-1.5 w-16 rounded-full bg-primary" />
          <div className="h-1.5 w-16 rounded-full bg-primary" />
          <div className="h-1.5 w-16 rounded-full bg-line" />
        </div>
      </div>

      {/* MAIN */}
      <main className="max-w-[1180px] mx-auto w-full px-4 sm:px-6 py-6 grid grid-cols-1 lg:grid-cols-[1fr_minmax(320px,380px)] gap-6 items-start">
        {/* LEFT — details form */}
        <div className="min-w-0 bg-white rounded-[10px] shadow-card">
          <div className="p-5 flex items-center gap-3 border-b border-line">
            <div
              className={`w-11 h-11 rounded-[10px] flex items-center justify-center shrink-0 ${type.tint}`}
            >
              <TypeIcon size={20} />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-ink">{type.label}</div>
              <div className="text-xs text-ink-muted">{type.subtitle}</div>
            </div>
          </div>

          <div className="p-5">
            <p className="text-sm text-ink-muted leading-relaxed">
              Fill in the details. The preview shows exactly what people will
              see when they scan.
            </p>

            {type.note && (
              <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-primary/[0.06] border border-primary/15 px-3 py-2.5">
                <Info size={15} className="text-primary shrink-0 mt-0.5" />
                <p className="text-xs text-ink-soft leading-relaxed">
                  {type.note}
                </p>
              </div>
            )}

            {showMissing && !complete && (
              <p
                role="alert"
                className="mt-3 rounded-[10px] border border-red-200 bg-red-50 px-3 py-2.5 text-[13px] font-medium text-red-700"
              >
                {missing.length === 1
                  ? `${missingLabels[0]} is needed before we can build your code.`
                  : `${missing.length} details are still needed: ${missingLabels.join(', ')}.`}
              </p>
            )}

            <TypeFields
              type={type}
              content={record.content || {}}
              onChange={setField}
              onComplete={handleContinue}
              missing={showMissing ? missing : []}
              className="mt-5"
            />

            {/* Footer: dynamic toggle + continue */}
            <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              {type.requiresDynamic ? (
                <div
                  className="flex items-center gap-3"
                  title="This type is only available as a Dynamic QR"
                >
                  <span className="pointer-events-none opacity-90">
                    <Toggle checked onChange={() => {}} />
                  </span>
                  <span className="text-sm font-medium text-ink-soft select-none">
                    Dynamic QR{' '}
                    <span className="text-ink-faint font-normal">
                      (required for this type)
                    </span>
                  </span>
                  <DynamicQRInfo />
                </div>
              ) : type.dynamicCapable ? (
                <div className="flex items-center gap-3">
                  <Toggle checked={record.dynamic} onChange={setDynamic} />
                  <span
                    onClick={() => setDynamic(!record.dynamic)}
                    className="text-sm font-medium text-ink-soft cursor-pointer select-none"
                  >
                    Dynamic QR{' '}
                    <span className="text-ink-faint font-normal">
                      (Statistics & Editability)
                    </span>
                  </span>
                  <DynamicQRInfo />
                </div>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs text-ink-faint">
                  <span className="w-1.5 h-1.5 rounded-full bg-ink-faint/50" />
                  Static QR — content is encoded directly
                </span>
              )}

              {/* Deliberately never disabled — see handleContinue. */}
              <button
                type="button"
                onClick={handleContinue}
                className="bg-primary text-white rounded-[10px] px-6 h-11 font-semibold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors whitespace-nowrap shadow-sm shadow-primary/25"
              >
                Generate QR <ArrowRight size={17} />
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT — scan experience preview */}
        <div className="lg:sticky lg:top-[88px]">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-xs font-semibold text-ink-muted">
              {asQR ? 'Your QR code preview' : 'What people see when they scan'}
            </span>
          </div>
          <ScanPreview record={record} />
          {/* For Text, Email, SMS, Phone and WhatsApp the two modes behave
              visibly differently when scanned, and that difference decides
              which one someone wants: static fires the action immediately,
              dynamic shows a page with a button first. Worth saying before the
              choice, not after the printing. */}
          <p className="mt-3 text-center text-[11px] text-ink-faint leading-relaxed max-w-[280px] mx-auto">
            {record.dynamic
              ? dynamicLandsOnPage(record.typeKey)
                ? `Dynamic QR — scanning opens a ${SHORT_HOST} page showing this, with a button to act on it. Editable later, and scans are counted.`
                : `Dynamic QR — opens through ${SHORT_HOST} so you can edit it later and track scans.`
              : dynamicLandsOnPage(record.typeKey)
                ? 'Static QR — the phone acts on this straight away, with no page in between. Fixed once printed.'
                : 'Static QR — your device handles this directly when scanned.'}
          </p>
        </div>
      </main>
    </div>
  )
}
