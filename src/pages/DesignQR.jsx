import { useEffect, useRef, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { useQueryClient } from '@tanstack/react-query'
import {
  ChevronLeft,
  ChevronDown,
  Ban,
  Trash2,
  Link2,
  Copy,
  Pencil,
  Check,
  Frame,
  QrCode,
  Grid2x2,
  ScanLine,
  RotateCw,
  Info,
  Download,
  X,
  BookmarkPlus,
  Wifi,
  MapPin,
  Building2,
  ImagePlus,
  CloudUpload,
} from 'lucide-react'
import { FaGoogle, FaWhatsapp, FaInstagram } from 'react-icons/fa'
import {
  getDraft,
  setDraft,
  clearDraft,
  defaultDesign,
  randomSlug,
  uid,
  todayISO,
  getTemplates,
  saveUserTemplate,
  copyToClipboard,
  SHORT_BASE_URL,
  shortUrlAbsolute,
} from '../lib/store'
import {
  LOGO_OPTIONS,
  PATTERN_OPTIONS,
  CORNER_OPTIONS,
  FRAME_OPTIONS,
  DOWNLOAD_FORMATS,
} from '../lib/qr'
import { findType, encodeContent, deriveContentName } from '../lib/qrTypes'
import { findActiveTemplate, filterTemplates } from '../lib/templateMatch'
import { compressImageFile } from '../lib/imageCompress'
import { useSaveQr } from '../hooks/useSaveQr'
import { useAuth } from '../context/AuthContext'
import { useLoginModal } from '../context/LoginModalContext'
import { useQr, qrQueryKey } from '../hooks/useQr'
import {
  connectionStatusLabel,
  useQrScanCount,
} from '../hooks/useQrScanCount'
import { getApiErrorMessage } from '../utils/errors'
import TypeFields from '../components/TypeFields'
import QRView from '../components/QRView'
import { Toggle, ColorField, Checkbox } from '../components/ui'
import Logo from '../components/Logo'

const fallbackRecord = () => ({
  id: uid(),
  name: '',
  type: 'Website URL',
  typeKey: 'url',
  content: { url: SHORT_BASE_URL },
  url: SHORT_BASE_URL,
  slug: randomSlug(),
  dynamic: true,
  qrType: 'Dynamic QR',
  folder: 'Untitled',
  editedOn: todayISO(),
  status: 'Active',
  scans: 0,
  design: defaultDesign(),
})

// Logo icon map — brand icons shown in the picker tiles (keys match LOGO_OPTIONS in qr.js)
const LOGO_ICONS = {
  company: {
    Icon: Building2,
    color: 'text-primary',
    bg: 'bg-primary/10',
    label: 'Company',
  },
  google: {
    Icon: FaGoogle,
    color: 'text-[#4285F4]',
    bg: 'bg-blue-50',
    label: 'Google',
  },
  maps: {
    Icon: MapPin,
    color: 'text-[#34A853]',
    bg: 'bg-green-50',
    label: 'Maps',
  },
  whatsapp: {
    Icon: FaWhatsapp,
    color: 'text-[#25D366]',
    bg: 'bg-green-50',
    label: 'WhatsApp',
  },
  instagram: {
    Icon: FaInstagram,
    color: 'text-[#E63B66]',
    bg: 'bg-pink-50',
    label: 'Instagram',
  },
}

function PatternGlyph({ type }) {
  const C = '#1F2430'
  const mask = [
    [1, 0, 1, 0, 1],
    [0, 1, 1, 1, 0],
    [1, 1, 0, 1, 1],
    [0, 1, 1, 1, 0],
    [1, 0, 1, 0, 1],
  ]
  const step = 4
  const start = 2
  const cells = []
  mask.forEach((row, r) =>
    row.forEach((on, c) => {
      if (!on) return
      const x = start + c * step
      const y = start + r * step
      const s = 3
      if (type === 'dots')
        cells.push(
          <circle
            key={`${r}-${c}`}
            cx={x + s / 2}
            cy={y + s / 2}
            r={s / 2}
            fill={C}
          />,
        )
      else if (type === 'rounded')
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={x}
            y={y}
            width={s}
            height={s}
            rx={1}
            fill={C}
          />,
        )
      else if (type === 'extra-rounded')
        cells.push(
          <rect
            key={`${r}-${c}`}
            x={x}
            y={y}
            width={s}
            height={s}
            rx={1.5}
            fill={C}
          />,
        )
      else if (type === 'classy')
        cells.push(
          <path
            key={`${r}-${c}`}
            d={`M${x} ${y} h${s} v${s} h-${s} a${s} ${s} 0 0 1 0 -${s} z`}
            fill={C}
          />,
        )
      else if (type === 'classy-rounded')
        cells.push(
          <path
            key={`${r}-${c}`}
            d={`M${x + 1.2} ${y} h${s - 1.2} v${s} h-${s} v-${s - 1.2} a1.2 1.2 0 0 1 1.2 -1.2 z`}
            fill={C}
          />,
        )
      else
        cells.push(
          <rect key={`${r}-${c}`} x={x} y={y} width={s} height={s} fill={C} />,
        )
    }),
  )
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      {cells}
    </svg>
  )
}

function CornerGlyph({ square, dot }) {
  const C = '#1F2430'
  let outer =
    square === 'dot' ? (
      <circle cx="12" cy="12" r="8" fill="none" stroke={C} strokeWidth="2.5" />
    ) : (
      <rect
        x="4"
        y="4"
        width="16"
        height="16"
        rx={square === 'extra-rounded' ? 5 : 0}
        fill="none"
        stroke={C}
        strokeWidth="2.5"
      />
    )
  let inner =
    dot === 'dot' ? (
      <circle cx="12" cy="12" r="3.4" fill={C} />
    ) : (
      <rect x="8.6" y="8.6" width="6.8" height="6.8" fill={C} />
    )
  return (
    <svg viewBox="0 0 24 24" className="h-full w-full" aria-hidden>
      {outer}
      {inner}
    </svg>
  )
}

function FrameGlyph({ frame }) {
  const S = 'SCAN'
  const qr = <QrCode size={18} className="text-ink" />
  const bar = (
    <div className="w-full bg-ink/80 text-white text-[5px] font-bold text-center py-0.5 leading-none">
      {S}
    </div>
  )
  const pill = (
    <div className="bg-ink/80 text-white text-[5px] font-bold px-2 py-0.5 rounded-full leading-none">
      {S}
    </div>
  )
  const border1 = 'border border-ink/70'

  if (frame.style === 'none') {
    return <Ban size={20} className="text-ink-faint" />
  }
  if (frame.style === 'border-only') {
    return <div className={`${border1} rounded-[10px] p-1`}>{qr}</div>
  }
  if (frame.style === 'box-bar') {
    return (
      <div className={`flex flex-col ${border1} w-full`}>
        {frame.position === 'top' && bar}
        <div className="flex justify-center p-0.5">{qr}</div>
        {frame.position !== 'top' && bar}
      </div>
    )
  }
  if (frame.style === 'rounded-box') {
    return (
      <div
        className={`flex flex-col ${border1} rounded-[10px] w-full overflow-hidden`}
      >
        <div className="flex justify-center p-1">{qr}</div>
        {bar}
      </div>
    )
  }
  if (frame.style === 'pill-label') {
    return (
      <div className="flex flex-col items-center gap-1">
        {qr}
        {pill}
      </div>
    )
  }
  if (frame.style === 'banner') {
    return (
      <div
        className={`flex flex-col ${border1} rounded-[10px] w-full overflow-hidden`}
      >
        {bar}
        <div className="flex justify-center p-0.5">{qr}</div>
        {bar}
      </div>
    )
  }
  return qr
}

// Frame preview wrapper — always renders the same DOM structure regardless of
// which frame is selected so QRView (children) never moves in the React tree.
// CSS display:none shows/hides slots; no conditional rendering that changes depth.
function QRFramePreview({ frame, accent, text: textProp, children }) {
  const f = frame || { style: 'none' }
  const color = accent || '#1B59F5'
  const text = textProp || f.text || 'SCAN ME'

  const showTopBar =
    f.style === 'banner' || (f.style === 'box-bar' && f.position === 'top')
  const showBottomBar =
    f.style === 'banner' ||
    f.style === 'rounded-box' ||
    (f.style === 'box-bar' && f.position !== 'top')
  const showPill = f.style === 'pill-label'
  const hasBorder = [
    'border-only',
    'box-bar',
    'rounded-box',
    'banner',
  ].includes(f.style)
  const isRounded = ['border-only', 'rounded-box', 'banner'].includes(f.style)
  const hasOverflow = ['rounded-box', 'banner'].includes(f.style)

  const Bar = ({ visible }) => (
    <div
      aria-hidden
      style={{ backgroundColor: color, display: visible ? undefined : 'none' }}
      className="w-full py-2.5 text-white text-[11px] font-extrabold text-center tracking-[0.18em] uppercase shrink-0 select-none"
    >
      {text}
    </div>
  )

  return (
    <div
      style={hasBorder ? { borderColor: color } : undefined}
      className={[
        'inline-flex flex-col items-center',
        hasBorder ? 'border-[3px]' : '',
        isRounded ? 'rounded-[10px]' : '',
        hasOverflow ? 'overflow-hidden' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <Bar visible={showTopBar} />
      <div className="p-3 flex items-center justify-center">{children}</div>
      <Bar visible={showBottomBar} />
      {/* Pill label — always rendered, hidden via display:none when not active */}
      <div
        aria-hidden
        style={{ display: showPill ? undefined : 'none' }}
        className="pb-1"
      >
        <div
          style={{ backgroundColor: color }}
          className="text-white text-[11px] font-extrabold px-6 py-1.5 rounded-full tracking-[0.18em] uppercase select-none"
        >
          {text}
        </div>
      </div>
    </div>
  )
}

// Save Template overlay
function SaveTemplateModal({ design, onSave, onSkip }) {
  const [name, setName] = useState('')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade">
      <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <BookmarkPlus size={18} className="text-primary" />
            <h2 className="font-semibold text-ink">Save as Template</h2>
          </div>
          <button
            type="button"
            onClick={onSkip}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-ink-soft hover:bg-canvas"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-ink-soft leading-relaxed">
            Your current design, colours, and logo will be saved as a reusable
            template.
          </p>
          <div>
            <label className="block text-xs text-ink-muted mb-1.5">
              Template Name
            </label>
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) =>
                e.key === 'Enter' && name.trim() && onSave(name.trim())
              }
              placeholder="e.g. My Brand Style"
              className="w-full h-11 rounded-[10px] border border-line px-4 text-sm text-ink focus:border-primary outline-none"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 h-10 rounded-[10px] border border-line text-ink-soft text-sm font-medium hover:bg-canvas transition-colors"
          >
            Skip
          </button>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => name.trim() && onSave(name.trim())}
            className="flex-1 h-10 rounded-[10px] bg-primary text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Save Template
          </button>
        </div>
      </div>
    </div>
  )
}

// Collapsible section wrapper. On desktop (lg+) it behaves exactly like the
// original always-open SectionHeader + content. On mobile it becomes an
// accordion — a heavy multi-section editor (content, logo, frames, patterns,
// corners) is otherwise a very long scroll on a phone.
function AccordionSection({
  icon: Icon,
  title,
  desc,
  defaultOpen = false,
  children,
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-start gap-3 text-left lg:cursor-default"
      >
        <span className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-[10px] bg-canvas text-ink-muted shrink-0">
          {Icon && <Icon size={18} />}
        </span>
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-semibold text-ink">{title}</h3>
          {desc && <p className="mt-0.5 text-xs text-ink-muted">{desc}</p>}
        </div>
        <ChevronDown
          size={18}
          className={`mt-1 shrink-0 text-ink-faint transition-transform lg:hidden ${open ? 'rotate-180' : ''}`}
        />
      </button>
      <div className={`${open ? 'block' : 'hidden'} lg:block`}>{children}</div>
    </div>
  )
}

const BUILTIN_TEMPLATES = [
  { label: 'Classic', design: { bodyPattern: 'square', cornerStyle: 0 } },
  { label: 'Rounded', design: { bodyPattern: 'rounded', cornerStyle: 4 } },
  { label: 'Dots', design: { bodyPattern: 'dots', cornerStyle: 3 } },
  {
    label: 'Branded',
    design: {
      bodyPattern: 'classy-rounded',
      cornerStyle: 8,
      bodyGradient: true,
      bodyColor1: '#1B59F5',
      bodyColor2: '#16C2C8',
    },
  },
]

export default function DesignQR() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const { websiteId: websiteIdParam } = useParams()
  const qrId = websiteIdParam ? Number(websiteIdParam) : null
  const isApiMode = qrId != null && Number.isFinite(qrId) && qrId > 0
  // Cloning hands off a fresh, unsaved draft here (see Dashboard's "Clone")
  // rather than saving directly — the user reviews/tweaks it before it's
  // actually created, so the primary action reads "Clone & Download".
  const isCloneFlow = !isApiMode && Boolean(location.state?.cloneFlow)
  const { data: apiRecord, isLoading, isError } = useQr(isApiMode ? qrId : null)
  const { saveQr, isSaving } = useSaveQr()
  const { isAuthenticated } = useAuth()
  const { openLogin } = useLoginModal()

  const qrRef = useRef(null)
  const fileRef = useRef(null)
  // Only hydrate from the API once per QR id — otherwise refetches / new
  // select() object identities overwrite in-progress edits (e.g. Remove logo).
  const hydratedQrIdRef = useRef(null)

  const [record, setRecord] = useState(() =>
    isApiMode ? fallbackRecord() : getDraft() || fallbackRecord(),
  )
  const [userTemplates, setUserTemplates] = useState(() => getTemplates())

  useEffect(() => {
    hydratedQrIdRef.current = null
  }, [qrId])

  // A dynamic code cannot be finished without an account — it resolves through
  // a short link we host. Ask here rather than letting someone design one and
  // only discover the wall when they press Download.
  useEffect(() => {
    if (isApiMode || isAuthenticated) return
    const draft = getDraft()
    if (draft?.dynamic) openLogin('/create/design')
  }, [isApiMode, isAuthenticated, openLogin])

  useEffect(() => {
    if (!isApiMode) {
      if (!getDraft()) navigate('/create')
      return
    }
    if (!apiRecord) return
    if (hydratedQrIdRef.current === apiRecord.id) return
    hydratedQrIdRef.current = apiRecord.id
    setRecord(apiRecord)
    setSlugDraft(apiRecord.slug)
  }, [isApiMode, apiRecord, navigate])

  useEffect(() => {
    if (isApiMode && isError) navigate('/dashboard')
  }, [isApiMode, isError, navigate])

  const persistRecord = (next) => {
    if (!isApiMode) setDraft(next)
    return next
  }

  const update = (patch) =>
    setRecord((r) => {
      const n = { ...r, ...patch }
      persistRecord(n)
      return n
    })
  const updateDesign = (patch) =>
    setRecord((r) => {
      const n = { ...r, design: { ...r.design, ...patch } }
      persistRecord(n)
      return n
    })
  const resetDesign = () =>
    setRecord((r) => {
      const n = { ...r, design: defaultDesign() }
      persistRecord(n)
      return n
    })

  // Edit the QR's actual content/inputs (Website URL, Wi-Fi, links, …).
  // Keeps the stored destination and (auto) name in sync. Persists to the draft
  // so it survives into save — that's what makes a Dynamic QR editable later.
  const updateContentField = (k, v) =>
    setRecord((r) => {
      const t = findType(r.typeKey)
      const content = { ...(r.content || {}), [k]: v }
      const patch = { content }
      if (t.kind === 'link') patch.url = encodeContent(r.typeKey, content)
      // keep the name in sync only if the user hasn't given it a custom one
      if (!r.name || r.name === deriveContentName(r.typeKey, r.content || {})) {
        patch.name = deriveContentName(r.typeKey, content)
      }
      const n = { ...r, ...patch }
      persistRecord(n)
      return n
    })

  const [editingUrl, setEditingUrl] = useState(false)
  const [slugDraft, setSlugDraft] = useState(record.slug)
  const [templateOpen, setTemplateOpen] = useState(false)
  const [templateQuery, setTemplateQuery] = useState('')
  // The template the person chose here, if they chose one. Only a tiebreak —
  // it is ignored the moment the design stops matching it.
  const [pickedTemplate, setPickedTemplate] = useState(null)
  const [saveTemplate, setSaveTemplate] = useState(false)
  const [showSaveTplModal, setShowSaveTplModal] = useState(false)
  const [format, setFormat] = useState('PNG')
  const [formatOpen, setFormatOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const { scanCount, connectionStatus } = useQrScanCount(
    isApiMode && record.dynamic ? record.slug : null,
  )
  const displayScans = scanCount ?? record.scans ?? 0

  const design = record.design

  const onUploadClick = () => fileRef.current?.click()
  const onFileChange = async (e) => {
    const file = e.target.files && e.target.files[0]
    e.target.value = ''
    if (!file) return
    try {
      const dataUrl = await compressImageFile(file)
      updateDesign({ logo: dataUrl })
    } catch (err) {
      toast.error(err?.message || 'Could not upload that image. Try another file.')
    }
  }

  const allTemplates = [...BUILTIN_TEMPLATES, ...userTemplates]

  // Named rather than remembered — see src/lib/templateMatch.js for why the
  // template in effect is derived from the design itself.
  const activeTemplate = findActiveTemplate(allTemplates, design, pickedTemplate)

  // A saved-template list can grow without limit, so past a certain size
  // scrolling to find one stops being reasonable.
  const visibleTemplates = filterTemplates(allTemplates, templateQuery)

  const applyTemplate = (tpl) => {
    updateDesign(tpl.design)
    setPickedTemplate(tpl.label)
    setTemplateOpen(false)
    setTemplateQuery('')
  }

  const saveQrToApi = async (currentRecord) => {
    await saveQr(currentRecord, {
      qrId,
      isUpdate: isApiMode,
    })
  }

  const finishAndGoToList = () => {
    clearDraft()
    navigate('/dashboard')
  }

  // A signed-out visitor is here with a static draft: the code is rendered in
  // the browser and the file is produced from it, so there is nothing to save
  // and nobody to save it for. Downloading is the whole job.
  const isGuest = !isAuthenticated && !isApiMode

  const downloadLabel = isSaving
    ? 'Saving...'
    : isGuest
      ? 'Download QR'
      : isCloneFlow
        ? 'Clone & Download'
        : saveTemplate
          ? 'Download & Save QR'
          : 'Save & Download QR'

  const handleDownload = async () => {
    if (isSaving) return

    if (isGuest) {
      // No API round trip at all — the save is what needs an account, not the
      // file. Staying on the page matters too: a guest has no dashboard to be
      // sent to, and their draft is still the thing they are working on.
      qrRef.current?.download(format, record.name || 'qr-code')
      toast.success('Downloaded. Sign in to save it and edit it later.')
      return
    }

    try {
      await saveQrToApi(record)
      if (isApiMode && qrId) {
        await queryClient.invalidateQueries({ queryKey: qrQueryKey(qrId) })
      }
      qrRef.current?.download(format, record.name || 'qr-code')

      if (isCloneFlow) toast.success('QR code cloned')

      if (saveTemplate) {
        setShowSaveTplModal(true)
        return
      }

      finishAndGoToList()
    } catch (error) {
      toast.error(
        getApiErrorMessage(error, 'Could not save your QR code. Please try again.'),
      )
    }
  }

  const handleSaveTemplate = (name) => {
    const tpl = { label: name, design: { ...record.design } }
    const updated = saveUserTemplate(tpl)
    setUserTemplates(updated)
    setShowSaveTplModal(false)
    finishAndGoToList()
  }

  const handleSkipTemplate = () => {
    setShowSaveTplModal(false)
    finishAndGoToList()
  }

  const handleCopyUrl = () => {
    copyToClipboard(shortUrlAbsolute(record.slug))
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const tileBase =
    'shrink-0 rounded-[10px] border-2 flex items-center justify-center bg-white transition-colors'

  if (isApiMode && (isLoading || !apiRecord)) {
    return (
      <div className="min-h-screen bg-canvas flex items-center justify-center">
        <p className="text-sm text-ink-muted">Loading your QR design...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex h-[68px] items-center gap-3 sm:gap-5 border-b border-line bg-white px-4 sm:px-6">
        <Logo />
        <div className="h-7 w-px bg-line" />
        <button
          type="button"
          onClick={() => navigate(isApiMode ? '/dashboard' : '/create/details')}
          className="flex items-center gap-1.5 font-semibold text-primary"
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
          <div className="h-1.5 w-16 rounded-full bg-primary" />
        </div>
      </div>

      <main className="mx-auto grid w-full max-w-[1240px] grid-cols-1 items-start gap-5 px-4 pt-5 pb-28 sm:px-6 sm:pt-6 lg:grid-cols-[1fr_minmax(380px,440px)] lg:gap-6 lg:pb-6">
        {/* LEFT COLUMN */}
        <section className="min-w-0 rounded-[10px] bg-white p-4 sm:p-6 shadow-card">
          {/* Header row */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-lg sm:text-xl font-semibold text-ink">
                Design Your QR Code
              </h1>
              {(() => {
                const t = findType(record.typeKey)
                const TIcon = t.Icon
                return (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${t.tint}`}
                  >
                    <TIcon size={13} />
                    {t.label}
                  </span>
                )
              })()}
            </div>
            <div className="relative">
              {/* Names the template in effect instead of the word "Template".
                  It said only "Template" before, which left no way to tell
                  which of them the code was wearing — unworkable once a few
                  have been saved, let alone a hundred. */}
              <button
                type="button"
                onClick={() => setTemplateOpen((v) => !v)}
                aria-expanded={templateOpen}
                aria-haspopup="listbox"
                aria-label={
                  activeTemplate
                    ? `Template: ${activeTemplate.label}. Choose another`
                    : 'Choose a template'
                }
                className="flex h-10 max-w-[240px] items-center gap-2 rounded-[10px] border border-primary px-4 text-sm font-medium text-primary hover:bg-primary-50"
              >
                <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-primary/60 shrink-0">
                  Template
                </span>
                <span className="truncate">
                  {activeTemplate ? activeTemplate.label : 'Choose'}
                </span>
                <ChevronDown size={16} className="shrink-0" />
              </button>
              {templateOpen && (
                <div
                  role="listbox"
                  className="absolute right-0 top-full z-20 mt-2 w-56 rounded-[10px] border border-line bg-white py-1 shadow-pop"
                >
                  {/* Only worth the space once the list is long enough to
                      scroll past what fits. */}
                  {allTemplates.length > 8 && (
                    <div className="px-2 pb-1 pt-1">
                      <input
                        type="text"
                        value={templateQuery}
                        onChange={(e) => setTemplateQuery(e.target.value)}
                        placeholder={`Search ${allTemplates.length} templates`}
                        aria-label="Search templates"
                        className="h-8 w-full rounded-[8px] border border-line px-2.5 text-[13px] text-ink outline-none focus:border-primary"
                      />
                    </div>
                  )}
                  {/* Capped so a long list scrolls inside the menu rather than
                      running off the bottom of the screen. */}
                  <div className="max-h-[280px] overflow-y-auto">
                    {allTemplates.length === 0 && (
                      <p className="px-4 py-3 text-xs text-ink-muted">
                        No templates yet.
                      </p>
                    )}
                    {allTemplates.length > 0 && visibleTemplates.length === 0 && (
                      <p className="px-4 py-3 text-xs text-ink-muted">
                        Nothing matches “{templateQuery.trim()}”.
                      </p>
                    )}
                    {visibleTemplates.map((t) => {
                      const isActive = activeTemplate?.label === t.label
                      return (
                        <button
                          key={t.label}
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onClick={() => applyTemplate(t)}
                          className={`flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-canvas ${
                            isActive
                              ? 'font-semibold text-primary'
                              : 'text-ink'
                          }`}
                        >
                          <Check
                            size={14}
                            className={`shrink-0 ${isActive ? 'opacity-100' : 'opacity-0'}`}
                          />
                          <span className="truncate flex-1">{t.label}</span>
                          {userTemplates.find((u) => u.label === t.label) && (
                            <span className="shrink-0 text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                              Custom
                            </span>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* NAME */}
          <div className="mt-5">
            <label className="block text-xs font-medium text-ink-muted mb-1.5">
              Name your QR
            </label>
            <div className="rounded-[10px] border border-line p-1.5">
              <input
                value={record.name}
                onChange={(e) => update({ name: e.target.value })}
                placeholder="e.g. Summer Sale Promo"
                className="h-11 w-full rounded-[10px] px-3 text-sm outline-none"
              />
            </div>
          </div>

          <hr className="my-6 border-line" />

          {/* QR CONTENT — editable inputs (Website URL, Wi-Fi, links, …) */}
          {(() => {
            const t = findType(record.typeKey)
            return (
              <div id="qr-content" className="scroll-mt-24">
                <AccordionSection
                  icon={t.Icon}
                  title={`${t.label} details`}
                  desc="Edit what this QR points to — changes are saved with the code."
                  defaultOpen
                >
                  {t.note && (
                    <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-primary/[0.06] border border-primary/15 px-3 py-2.5">
                      <Info
                        size={15}
                        className="text-primary shrink-0 mt-0.5"
                      />
                      <p className="text-xs text-ink-soft leading-relaxed">
                        {t.note}
                      </p>
                    </div>
                  )}
                  <TypeFields
                    type={t}
                    content={record.content || {}}
                    onChange={updateContentField}
                    className="mt-4"
                  />
                </AccordionSection>
              </div>
            )
          })()}

          <hr className="my-6 border-line" />

          {/* ADD LOGO */}
          <AccordionSection
            icon={ImagePlus}
            title="Add Logo"
            desc="Add a central logo or upload your own image."
          >
            {/* Logo preset strip */}
            <div className="scroll-x mt-4 flex gap-2.5 overflow-x-auto pb-2">
              {/* No logo tile */}
              <button
                type="button"
                onClick={() => updateDesign({ logo: null })}
                title="No logo"
                className={`${tileBase} h-14 w-14 flex-col gap-0.5 ${
                  design.logo == null
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-line text-ink-faint'
                }`}
              >
                <Ban size={20} />
                <span className="text-[9px] font-medium leading-none">
                  None
                </span>
              </button>

              {/* Brand preset tiles — render the actual logo images */}
              {LOGO_OPTIONS.map((o) => (
                <button
                  key={o.key}
                  type="button"
                  onClick={() => updateDesign({ logo: o.key })}
                  title={o.label}
                  className={`${tileBase} h-14 w-14 flex-col gap-0.5 ${
                    design.logo === o.key
                      ? 'border-primary ring-2 ring-primary/20'
                      : 'border-line'
                  }`}
                >
                  <img
                    src={o.image}
                    alt={o.label}
                    className="w-8 h-8 rounded-[8px] object-contain"
                  />
                  <span className="text-[9px] font-medium text-ink-muted leading-none truncate max-w-[52px] px-1">
                    {o.label}
                  </span>
                </button>
              ))}
            </div>

            {design.logo != null && (
              <div className="mt-4 flex items-center gap-3">
                <span className="w-20 text-sm text-ink-soft">Logo Size</span>
                <input
                  type="range"
                  className="range-primary flex-1"
                  min={0.2}
                  max={0.6}
                  step={0.02}
                  value={design.logoSize}
                  onChange={(e) =>
                    updateDesign({ logoSize: parseFloat(e.target.value) })
                  }
                />
              </div>
            )}

            {/* Always available: upload your own logo (also replaces a preset) */}
            <button
              type="button"
              onClick={onUploadClick}
              className="mt-4 w-full rounded-[10px] border-2 border-dashed border-line hover:border-primary hover:bg-primary/[0.02] transition-colors p-5 flex flex-col items-center gap-2 group"
            >
              {typeof design.logo === 'string' &&
              design.logo.startsWith('data:') ? (
                <img
                  src={design.logo}
                  alt="Uploaded logo"
                  className="h-12 w-12 rounded-[8px] object-contain border border-line bg-white"
                />
              ) : (
                <div className="w-10 h-10 rounded-[10px] bg-canvas border border-line group-hover:border-primary group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                  <CloudUpload
                    size={20}
                    className="text-ink-muted group-hover:text-primary transition-colors"
                  />
                </div>
              )}
              <div className="text-center">
                <p className="text-sm font-medium text-ink-soft group-hover:text-primary transition-colors">
                  {typeof design.logo === 'string' &&
                  design.logo.startsWith('data:')
                    ? 'Change uploaded logo'
                    : 'Upload your logo'}
                </p>
                <p className="text-xs text-ink-faint mt-0.5">
                  PNG, JPG, SVG · Max 2MB
                </p>
              </div>
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={onFileChange}
            />

            {design.logo != null && (
              <button
                type="button"
                onClick={() => updateDesign({ logo: null })}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border-2 border-dashed border-danger py-3 text-sm font-medium text-danger hover:bg-red-50"
              >
                <Trash2 size={16} /> Remove logo
              </button>
            )}
          </AccordionSection>

          {record.dynamic && (
            <>
              <hr className="my-6 border-line" />

              {/* SHORT URL */}
              <AccordionSection
                icon={Link2}
                title="Short URL"
                desc="Copy or edit the URL created for you."
              >
                {!editingUrl ? (
                  <div className="mt-4 flex items-center gap-3">
                    <div className="relative flex-1">
                      <input
                        readOnly
                        value={shortUrlAbsolute(record.slug)}
                        className="h-12 w-full rounded-[10px] border border-line bg-canvas px-4 pr-11 text-sm text-ink"
                      />
                      <button
                        type="button"
                        onClick={handleCopyUrl}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2"
                        aria-label="Copy URL"
                      >
                        {copied ? (
                          <Check size={18} className="text-success" />
                        ) : (
                          <Copy
                            size={18}
                            className="text-ink-muted hover:text-primary"
                          />
                        )}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSlugDraft(record.slug)
                        setEditingUrl(true)
                      }}
                      className="flex h-11 w-11 items-center justify-center rounded-[10px] border border-line text-primary hover:bg-primary-50"
                      aria-label="Edit URL"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <input
                      readOnly
                      value={`${SHORT_BASE_URL}/`}
                      className="h-12 min-w-[180px] flex-1 rounded-[10px] border border-line bg-canvas px-4 text-sm text-ink-muted"
                    />
                    <div className="relative">
                      <input
                        value={slugDraft}
                        onChange={(e) => setSlugDraft(e.target.value)}
                        className="h-12 w-[200px] rounded-[10px] border border-line px-4 pr-10 text-sm"
                      />
                      <Check
                        size={18}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        update({ slug: slugDraft.trim() || record.slug })
                        setEditingUrl(false)
                      }}
                      className="h-12 rounded-[10px] bg-primary px-6 font-medium text-white hover:bg-primary-600"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingUrl(false)}
                      className="h-12 rounded-[10px] border border-primary px-6 font-medium text-primary hover:bg-primary-50"
                    >
                      Cancel
                    </button>
                  </div>
                )}

                {isApiMode && (
                  <div className="mt-4 flex items-center justify-between rounded-[10px] border border-line bg-canvas px-3.5 py-2.5">
                    <p className="text-sm text-ink-muted">
                      QR Code:{' '}
                      <span className="font-semibold text-ink">{record.slug}</span>
                    </p>
                    <p className="text-sm text-ink-muted">
                      Total Scans:{' '}
                      <span className="font-semibold text-ink">
                        {displayScans.toLocaleString()}
                      </span>
                    </p>
                    <p
                      className={`text-xs font-bold ${
                        connectionStatus === 'connected'
                          ? 'text-success'
                          : 'text-ink-faint'
                      }`}
                    >
                      {connectionStatusLabel(connectionStatus)}
                    </p>
                  </div>
                )}
              </AccordionSection>
            </>
          )}

          <hr className="my-6 border-line" />

          {/* FRAMES */}
          <AccordionSection
            icon={Frame}
            title="Frames"
            desc="Frames make your QR code stand out and inspire more scans."
          >
            <div className="scroll-x mt-4 flex gap-2.5 overflow-x-auto pb-2">
              {FRAME_OPTIONS.map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => updateDesign({ frame: f.key })}
                  className={`${tileBase} h-16 w-16 p-1 ${design.frame === f.key ? 'border-primary ring-2 ring-primary/20' : 'border-line'}`}
                >
                  <FrameGlyph frame={f} />
                </button>
              ))}
            </div>

            {/* Editable frame label — shown only when an active frame has a text bar/pill */}
            {['box-bar', 'rounded-box', 'pill-label', 'banner'].includes(
              FRAME_OPTIONS.find((f) => f.key === design.frame)?.style,
            ) && (
              <div className="mt-4">
                <label className="block text-xs font-medium text-ink-muted mb-1.5">
                  Label Text
                </label>
                <input
                  type="text"
                  value={design.frameText ?? 'SCAN ME'}
                  onChange={(e) =>
                    updateDesign({ frameText: e.target.value.toUpperCase() })
                  }
                  maxLength={20}
                  placeholder="SCAN ME"
                  className="w-full h-10 rounded-[10px] border border-line bg-canvas px-3 text-sm font-semibold text-ink tracking-widest uppercase focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition"
                />
              </div>
            )}
          </AccordionSection>

          <hr className="my-6 border-line" />

          {/* BODY PATTERNS */}
          <AccordionSection
            icon={Grid2x2}
            title="Body Patterns"
            desc="Customize the central area by combining shapes and colours."
          >
            <div className="scroll-x mt-4 flex gap-2.5 overflow-x-auto pb-2">
              {PATTERN_OPTIONS.map((p) => (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => updateDesign({ bodyPattern: p.key })}
                  className={`${tileBase} h-16 w-16 p-2 ${design.bodyPattern === p.key ? 'border-primary ring-2 ring-primary/20' : 'border-line'}`}
                >
                  <PatternGlyph type={p.type} />
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center justify-between rounded-[10px] bg-canvas px-4 py-4">
                <span className="text-sm text-ink-soft">
                  Use a Gradient Pattern Color
                </span>
                <Toggle
                  checked={design.bodyGradient}
                  onChange={(v) => updateDesign({ bodyGradient: v })}
                />
              </div>
              <ColorField
                className="w-full sm:w-44"
                value={design.bodyColor1}
                onChange={(v) => updateDesign({ bodyColor1: v })}
              />
              {design.bodyGradient && (
                <ColorField
                  className="w-full sm:w-44"
                  value={design.bodyColor2}
                  onChange={(v) => updateDesign({ bodyColor2: v })}
                />
              )}
            </div>
          </AccordionSection>

          <hr className="my-6 border-line" />

          {/* CORNERS */}
          <AccordionSection
            icon={ScanLine}
            title="Corners"
            desc="Select your QR code's corner style."
          >
            <div className="scroll-x mt-4 flex gap-2.5 overflow-x-auto pb-2">
              {CORNER_OPTIONS.map((c, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => updateDesign({ cornerStyle: i })}
                  className={`${tileBase} h-14 w-14 p-2 ${design.cornerStyle === i ? 'border-primary ring-2 ring-primary/20' : 'border-line'}`}
                >
                  <CornerGlyph square={c.square} dot={c.dot} />
                </button>
              ))}
            </div>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="flex flex-1 items-center justify-between rounded-[10px] bg-canvas px-4 py-4">
                <span className="text-sm text-ink-soft">
                  Use a Gradient Pattern Color
                </span>
                <Toggle
                  checked={design.cornerGradient}
                  onChange={(v) => updateDesign({ cornerGradient: v })}
                />
              </div>
              <ColorField
                className="w-full sm:w-44"
                value={design.cornerColor1}
                onChange={(v) => updateDesign({ cornerColor1: v })}
              />
              {design.cornerGradient && (
                <ColorField
                  className="w-full sm:w-44"
                  value={design.cornerColor2}
                  onChange={(v) => updateDesign({ cornerColor2: v })}
                />
              )}
            </div>
          </AccordionSection>
        </section>

        {/* RIGHT COLUMN — PREVIEW */}
        <aside className="lg:sticky lg:top-6 flex flex-col rounded-[10px] bg-white shadow-card">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div className="flex items-center gap-3">
              {(() => {
                const t = findType(record.typeKey)
                const TIcon = t.Icon
                return (
                  <>
                    <span
                      className={`flex h-11 w-11 items-center justify-center rounded-[10px] ${t.tint}`}
                    >
                      <TIcon size={20} />
                    </span>
                    <div>
                      <div className="font-semibold text-ink">{t.label}</div>
                      <div className="text-xs text-ink-muted">{t.subtitle}</div>
                    </div>
                  </>
                )
              })()}
            </div>
            <button
              type="button"
              onClick={() =>
                document
                  .getElementById('qr-content')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
              }
              className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-line text-ink-muted hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
              aria-label="Edit details"
              title="Edit details"
            >
              <Pencil size={16} />
            </button>
          </div>

          <div className="flex flex-col items-center p-5">
            <div className="text-sm font-semibold text-ink-muted">Preview</div>
            <div className="mt-4 flex items-center justify-center rounded-[10px] border border-line bg-white p-5 shadow-sm">
              <QRFramePreview
                frame={FRAME_OPTIONS.find(
                  (f) => f.key === (record.design?.frame || 'none'),
                )}
                accent={record.design?.bodyColor1 || '#1B59F5'}
                text={record.design?.frameText}
              >
                <QRView ref={qrRef} record={record} size={220} />
              </QRFramePreview>
            </div>
            <button
              type="button"
              onClick={resetDesign}
              className="mt-5 flex items-center gap-2 font-semibold text-primary hover:underline"
            >
              <RotateCw size={18} /> Reset Design
            </button>
            <div className="mt-5 flex w-full items-start gap-2.5 rounded-[10px] bg-canvas p-3 text-xs text-ink-muted">
              <Info size={28} className="shrink-0 text-ink-faint" />
              <span>
                This is a preview of how your QR will look. Download to get the
                final version.
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 border-t border-line p-5">
            <div className="flex items-center rounded-[10px] bg-primary-50/60 px-3 py-3">
              <Checkbox
                checked={saveTemplate}
                onChange={setSaveTemplate}
                label="Save as Template when Finished"
              />
            </div>
            {/* Desktop download row — on mobile this lives in the sticky bar below */}
            <div className="hidden lg:flex items-center gap-3">
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setFormatOpen((v) => !v)}
                  className="flex h-12 items-center gap-2 rounded-[10px] border border-primary px-4 font-medium text-primary hover:bg-primary-50"
                >
                  {format} <ChevronDown size={16} />
                </button>
                {formatOpen && (
                  <div className="absolute bottom-full left-0 z-20 mb-2 w-32 rounded-[10px] border border-line bg-white py-1 shadow-pop">
                    {DOWNLOAD_FORMATS.map((f) => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => {
                          setFormat(f)
                          setFormatOpen(false)
                        }}
                        className="flex w-full items-center px-4 py-2 text-left text-sm text-ink hover:bg-canvas"
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={handleDownload}
                disabled={isSaving}
                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary font-semibold text-white hover:bg-primary-600 disabled:opacity-70"
              >
                <Download size={18} />
                {downloadLabel}
              </button>
            </div>
          </div>
        </aside>
      </main>

      {/* MOBILE STICKY DOWNLOAD BAR — the QR is already generated, so the
          primary action (download) stays pinned and reachable without
          scrolling past the editor. Hidden on lg+ where the aside is sticky. */}
      <div
        className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2.5 border-t border-line bg-white/95 px-4 py-3 backdrop-blur lg:hidden"
        style={{
          boxShadow: '0 -2px 14px rgba(16, 24, 40, 0.08)',
          paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))',
        }}
      >
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setFormatOpen((v) => !v)}
            className="flex h-12 items-center gap-2 rounded-[10px] border border-primary px-4 font-medium text-primary"
          >
            {format}{' '}
            <ChevronDown
              size={16}
              className={`transition-transform ${formatOpen ? 'rotate-180' : ''}`}
            />
          </button>
          {formatOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-2 w-32 rounded-[10px] border border-line bg-white py-1 shadow-pop">
              {DOWNLOAD_FORMATS.map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => {
                    setFormat(f)
                    setFormatOpen(false)
                  }}
                  className="flex w-full items-center px-4 py-2 text-left text-sm text-ink hover:bg-canvas"
                >
                  {f}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={isSaving}
          className="flex h-12 flex-1 items-center justify-center gap-2 rounded-[10px] bg-primary font-semibold text-white hover:bg-primary-600 disabled:opacity-70"
        >
          <Download size={18} />
          {downloadLabel}
        </button>
      </div>

      {showSaveTplModal && (
        <SaveTemplateModal
          design={record.design}
          onSave={handleSaveTemplate}
          onSkip={handleSkipTemplate}
        />
      )}
    </div>
  )
}
