import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronsUpDown,
  ChevronDown,
  Search,
  Copy,
  Check,
  Download,
  MoreVertical,
  Pencil,
  Trash2,
  X,
  QrCode,
  BarChart2,
  Zap,
  Plus,
  ExternalLink,
  LayoutGrid,
  List,
} from 'lucide-react'
import {
  setDraft,
  clearDraft,
  shortUrl,
  randomSlug,
  formatDate,
  copyToClipboard,
} from '../lib/store'
import { useQrs, useDeleteQr, useSetQrStatus } from '../hooks/useQrs'
import { useQrScanCount } from '../hooks/useQrScanCount'
import { DOWNLOAD_FORMATS } from '../lib/qr'
import { findType } from '../lib/qrTypes'
import { dashboardStats } from '../lib/dashboardStats'
import QRView from '../components/QRView'
import Layout from '../components/Layout'
import { Toggle } from '../components/ui'

const normaliseType = (t) => (t === 'Statistic' ? 'Static QR' : t)

// Static QRs encode their content directly into the code — there's no redirect
// slug, so short URL / scan tracking / active-inactive status don't apply.
const isDynamicRow = (row) =>
  Boolean(row.dynamic) || normaliseType(row.qrType) === 'Dynamic QR'

// Cloning doesn't copy the record outright — it seeds a fresh, unsaved draft
// (new slug, reset scan count) and hands off to the design page so the user
// can review/tweak it before it's actually created.
const buildCloneDraft = (row) => {
  const { id: _id, editedOn: _editedOn, ...rest } = row
  return {
    ...rest,
    name: `${row.name} (Copy)`,
    slug: randomSlug(),
    scans: 0,
    status: 'Active',
  }
}

const FILTERS = ['All', 'Dynamic QR', 'Static QR']
const BATCH = 8
const VIEWS = ['card', 'table']

// Device-appropriate default when the user hasn't picked a view yet: the compact
// table/list on phones, the roomier card grid on larger screens. An explicit
// choice (persisted to localStorage) always wins over this.
const defaultView = () =>
  typeof window !== 'undefined' && window.innerWidth < 768 ? 'table' : 'card'

function QrScanSubscriber({ slug }) {
  useQrScanCount(slug)
  return null
}

/* ─── Shared card primitives ─────────────────────────────────────────── */
// The type pill + the short-URL copy toggle are rendered identically across the
// table row, the mobile list card, and the grid card — extracted so the colour
// rule and the copy-with-feedback behaviour live in one place.
function TypeBadge({ type, short = false }) {
  return (
    <span
      className={`inline-block shrink-0 whitespace-nowrap px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
        type === 'Dynamic QR'
          ? 'bg-primary/10 text-primary'
          : 'bg-emerald-50 text-emerald-600'
      }`}
    >
      {short ? type.replace(' QR', '') : type}
    </span>
  )
}

// Content type of the QR (Website URL, Text, Wi-Fi, Contact Card, …) — the icon
// + label from the type registry, keyed off the record's typeKey. Distinct from
// the Dynamic/Static "mode" shown by TypeBadge.
function ContentType({ typeKey, className = '' }) {
  const t = findType(typeKey)
  const Icon = t.Icon
  return (
    <span className={`inline-flex min-w-0 items-center gap-1.5 ${className}`}>
      <span
        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[10px] ${t.tint}`}
      >
        <Icon size={13} />
      </span>
      <span className="truncate text-[13px] font-medium text-ink">
        {t.label}
      </span>
    </span>
  )
}

// Active/Inactive status pill (dot + label). Dynamic QRs can be toggled
// inactive; anything not explicitly 'Inactive' reads as Active.
function isInactiveStatus(status) {
  return (
    status === 'Inactive' ||
    status === false ||
    status === 0 ||
    status === 'false'
  )
}

function StatusIndicator({ status, className = '' }) {
  const inactive = isInactiveStatus(status)
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold ${inactive ? 'text-ink-faint' : 'text-success'} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${inactive ? 'bg-ink-faint' : 'bg-success'}`}
      />
      {inactive ? 'Inactive' : 'Active'}
    </span>
  )
}

function useCopySlug(slug) {
  const [copied, setCopied] = useState(false)
  const copy = (e) => {
    e.stopPropagation()
    copyToClipboard(shortUrl(slug))
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return [copied, copy]
}

function CopySlugButton({ slug }) {
  const [copied, copy] = useCopySlug(slug)
  return (
    <button
      type="button"
      onClick={copy}
      className={`shrink-0 transition-colors ${copied ? 'text-success' : 'text-ink-faint hover:text-primary'}`}
      title={copied ? 'Copied!' : 'Copy short URL'}
      aria-label={copied ? 'Copied' : 'Copy short URL'}
    >
      {copied ? <Check size={12} /> : <Copy size={12} />}
    </button>
  )
}

function ViewToggle({ view, onChange, className = '' }) {
  return (
    <div
      className={`flex items-center gap-1 rounded-[10px] bg-canvas p-1 shrink-0 ${className}`}
    >
      {[
        { k: 'card', Icon: LayoutGrid, label: 'Card view' },
        { k: 'table', Icon: List, label: 'Table view' },
      ].map(({ k, Icon, label }) => (
        <button
          key={k}
          type="button"
          onClick={() => onChange(k)}
          aria-label={label}
          aria-pressed={view === k}
          title={label}
          className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
            view === k
              ? 'bg-white text-primary shadow-sm'
              : 'text-ink-faint hover:text-ink'
          }`}
        >
          <Icon size={16} />
        </button>
      ))}
    </div>
  )
}

function SkeletonRow() {
  return (
    <tr className="border-b border-line">
      <td className="py-3.5 pl-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 shrink-0 rounded-[10px] shimmer" />
          <div className="space-y-2">
            <div className="h-3.5 w-32 shimmer rounded" />
            <div className="h-3 w-24 shimmer rounded" />
          </div>
        </div>
      </td>
      <td className="py-3.5 pr-4">
        <div className="h-6 w-24 rounded-full shimmer" />
      </td>
      <td className="py-3.5 pr-4">
        <div className="h-3.5 w-16 shimmer rounded" />
      </td>
      <td className="py-3.5 pr-4">
        <div className="h-3.5 w-14 shimmer rounded" />
      </td>
      <td className="py-3.5 pr-4">
        <div className="h-3.5 w-10 shimmer rounded" />
      </td>
      <td className="py-3.5 pr-4">
        <div className="flex justify-end gap-2">
          <div className="h-8 w-8 rounded-[10px] shimmer" />
          <div className="h-8 w-8 rounded-[10px] shimmer" />
        </div>
      </td>
    </tr>
  )
}

/* ─── QR Details Modal ───────────────────────────────────────────────── */
function QrModal({ row, onClose, onDelete, onEdit, onToggleStatus, onClone }) {
  const qrRef = useRef(null)
  const [urlCopied, setUrlCopied] = useState(false)
  const [format, setFormat] = useState('PNG')
  const [fmtOpen, setFmtOpen] = useState(false)
  const fmtWrapRef = useRef(null)
  const typeLabel = normaliseType(row.qrType)
  const isDynamic = Boolean(row.dynamic) || typeLabel === 'Dynamic QR'
  const { scanCount, connectionStatus } = useQrScanCount(
    isDynamic ? row.slug : null,
  )
  const scansLoading =
    isDynamic &&
    scanCount === null &&
    (connectionStatus === 'connecting' || connectionStatus === 'connected')
  const resolvedScans = scanCount ?? row.scans
  // Local UI status so the Active toggle flips instantly (same as Liffto).
  const [status, setStatus] = useState(row.status ?? 'Active')
  const isActive = !isInactiveStatus(status)

  useEffect(() => {
    setStatus(row.status ?? 'Active')
  }, [row.id, row.status])

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  useEffect(() => {
    const h = (e) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [onClose])

  useEffect(() => {
    if (!fmtOpen) return undefined
    const h = (e) => {
      if (fmtWrapRef.current && !fmtWrapRef.current.contains(e.target))
        setFmtOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [fmtOpen])

  const handleDownload = () => {
    qrRef.current?.download(format, row.name || 'qr-code')
    setFmtOpen(false)
  }

  const handleCopy = () => {
    copyToClipboard(shortUrl(row.slug))
    setUrlCopied(true)
    setTimeout(() => setUrlCopied(false), 2000)
  }

  const handleDelete = () => {
    if (window.confirm(`Delete "${row.name}"? This cannot be undone.`)) {
      onDelete(row.id)
      onClose()
    }
  }

  const handleToggleActive = (v) => {
    const next = v ? 'Active' : 'Inactive'
    setStatus(next)
    onToggleStatus?.(row.id, next)
  }

  const handleClone = () => {
    onClone?.(row)
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/40 backdrop-blur-sm animate-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-t-[10px] sm:rounded-[10px] shadow-2xl w-full max-w-[480px] max-h-[100dvh] sm:max-h-[min(720px,calc(100dvh-2rem))] flex flex-col animate-pop overflow-hidden">
        {/* ── Header ── */}
        <div className="shrink-0 flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-bold text-ink text-[15px]">QR Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-ink-faint hover:bg-canvas hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain">
        {/* ── QR preview strip ── */}
        <div className="bg-gradient-to-b from-canvas to-white px-5 pt-6 pb-4 flex flex-col items-center gap-3 border-b border-line">
          <div className="w-[164px] h-[164px] rounded-[10px] bg-white shadow-md border border-line flex items-center justify-center overflow-hidden">
            <QRView ref={qrRef} record={row} size={148} />
          </div>
          <div className="text-center">
            <p className="font-bold text-ink text-base leading-tight">
              {row.name}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1.5 flex-wrap">
              <ContentType typeKey={row.typeKey} />
              <TypeBadge type={typeLabel} />
              {isDynamic && (
                <StatusIndicator status={status} className="text-[11px]" />
              )}
            </div>
          </div>
        </div>

        {/* ── Info grid ── */}
        <div className="px-5 py-4 space-y-3.5">
          {/* Destination URL */}
          <div>
            <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-1">
              Destination URL
            </p>
            <div className="flex items-center gap-2">
              <p className="text-sm text-ink-soft truncate flex-1">{row.url}</p>
              <a
                href={row.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="shrink-0 text-ink-faint hover:text-primary transition-colors"
                title="Open URL"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>

          {/* Short URL — Dynamic QRs only (Static QRs encode content directly) */}
          {isDynamic && (
            <div>
              <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest mb-1">
                Short URL
              </p>
              <div className="flex items-center gap-2">
                <p className="text-sm text-primary font-medium">
                  {shortUrl(row.slug)}
                </p>
                <button
                  type="button"
                  onClick={handleCopy}
                  className={`shrink-0 flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-[10px] border transition-all ${
                    urlCopied
                      ? 'border-success bg-success/10 text-success'
                      : 'border-line text-ink-faint hover:border-primary hover:text-primary hover:bg-primary/5'
                  }`}
                >
                  {urlCopied ? (
                    <>
                      <Check size={11} /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy size={11} /> Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Active / Inactive — Dynamic QRs only (same UI as Liffto) */}
          {isDynamic && (
            <div className="flex items-center justify-between gap-3 rounded-[10px] border border-line px-3.5 py-3">
              <div className="min-w-0">
                <p className="text-[13px] font-semibold text-ink">
                  {isActive ? 'QR is Active' : 'QR is Inactive'}
                </p>
                <p className="text-[11px] text-ink-muted mt-0.5 leading-snug">
                  {isActive
                    ? 'Scans redirect to your destination.'
                    : 'Scans show an inactive notice — no redirect.'}
                </p>
              </div>
              <Toggle
                checked={isActive}
                ariaLabel={
                  isActive ? 'Deactivate this QR code' : 'Activate this QR code'
                }
                onChange={handleToggleActive}
              />
            </div>
          )}

          {/* Stats row — Scans / Status are Dynamic-only (Static QRs aren't scan-tracked) */}
          <div
            className={`grid gap-2 pt-1 ${isDynamic ? 'grid-cols-3' : 'grid-cols-1'}`}
          >
            {isDynamic && (
              <div className="bg-canvas rounded-[10px] px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wide mb-1">
                  Scans
                </p>
                <p className="text-sm font-bold text-ink">
                  {scansLoading ? (
                    <span className="inline-flex items-center justify-center gap-1">
                      <span
                        className="inline-block h-3.5 w-8 rounded shimmer"
                        aria-hidden
                      />
                      <span className="font-normal text-ink-faint"> scans</span>
                    </span>
                  ) : (
                    <>
                      {resolvedScans > 0 ? resolvedScans.toLocaleString() : '—'}
                      <span className="font-normal text-ink-faint"> scans</span>
                    </>
                  )}
                </p>
              </div>
            )}
            <div className="bg-canvas rounded-[10px] px-3 py-2.5 text-center">
              <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wide mb-1">
                Edited
              </p>
              <p className="text-sm font-bold text-ink">
                {formatDate(row.editedOn)}
              </p>
            </div>
            {isDynamic && (
              <div className="bg-canvas rounded-[10px] px-3 py-2.5 text-center">
                <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wide mb-1">
                  Status
                </p>
                <p
                  className={`text-sm font-bold ${isActive ? 'text-success' : 'text-ink'}`}
                >
                  {isActive ? 'Active' : 'Inactive'}
                </p>
              </div>
            )}
          </div>
        </div>
        </div>

        {/* ── Actions ── */}
        <div className="shrink-0 border-t border-line bg-white px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] flex flex-col sm:flex-row gap-2.5">
          {/* Download + format selector (split control) */}
          <div ref={fmtWrapRef} className="relative w-full sm:flex-1">
            <div className="flex h-10 rounded-[10px] border border-line overflow-hidden">
              <button
                type="button"
                onClick={handleDownload}
                className="flex-1 flex items-center justify-center gap-2 text-ink-soft text-sm font-semibold hover:bg-primary/5 hover:text-primary transition-colors"
              >
                <Download size={15} /> Download
              </button>
              <button
                type="button"
                onClick={() => setFmtOpen((v) => !v)}
                aria-label="Choose format"
                className={`w-[58px] border-l border-line flex items-center justify-center gap-0.5 text-xs font-bold transition-colors ${
                  fmtOpen
                    ? 'bg-primary/5 text-primary'
                    : 'text-ink-muted hover:bg-canvas'
                }`}
              >
                {format}{' '}
                <ChevronDown
                  size={13}
                  className={
                    fmtOpen
                      ? 'rotate-180 transition-transform'
                      : 'transition-transform'
                  }
                />
              </button>
            </div>
            {fmtOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-full rounded-[10px] border border-line bg-white py-1 shadow-pop z-10 animate-pop">
                {DOWNLOAD_FORMATS.map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => {
                      setFormat(f)
                      setFmtOpen(false)
                    }}
                    className={`flex w-full items-center justify-between px-3.5 py-2 text-left text-sm hover:bg-canvas transition-colors ${
                      f === format
                        ? 'text-primary font-semibold'
                        : 'text-ink-soft'
                    }`}
                  >
                    {f} {f === format && <Check size={14} />}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className="flex gap-2.5 sm:flex-1">
            {isDynamic ? (
              <button
                type="button"
                onClick={onEdit}
                className="flex-1 h-10 rounded-[10px] bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors shadow-sm shadow-primary/25"
              >
                <Pencil size={14} /> Edit Design
              </button>
            ) : (
              <button
                type="button"
                onClick={handleClone}
                className="flex-1 h-10 rounded-[10px] bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors shadow-sm shadow-primary/25"
              >
                <Copy size={14} /> Clone QR
              </button>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="h-10 w-10 shrink-0 rounded-[10px] border border-line text-ink-faint flex items-center justify-center hover:border-danger hover:bg-red-50 hover:text-danger transition-colors"
              aria-label="Delete"
              title="Delete QR code"
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Row / card action menu (Edit · Duplicate · Delete) ─────────────── */
// The table wrapper uses overflow-x-auto, which per the CSS overflow spec
// implicitly forces overflow-y to auto too — any absolutely-positioned dropdown
// that extends past the table's own box gets clipped. Rendering the menu with
// position:fixed (computed from the trigger's rect) escapes that clipping since
// fixed elements lay out against the viewport. Shared by the table row and the
// grid card.
function ActionMenu({ row }) {
  const navigate = useNavigate()
  const deleteMutation = useDeleteQr()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const menuWrapRef = useRef(null)
  const menuBtnRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return undefined
    const h = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target))
        setMenuOpen(false)
    }
    // Close on scroll too — the menu is viewport-fixed so it won't follow the
    // trigger if the page scrolls underneath it.
    const closeOnScroll = () => setMenuOpen(false)
    document.addEventListener('mousedown', h)
    window.addEventListener('scroll', closeOnScroll, true)
    return () => {
      document.removeEventListener('mousedown', h)
      window.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [menuOpen])

  const MENU_W = 176 // w-44
  const MENU_H = 122 // ~3 items + divider
  const toggleMenu = (e) => {
    e.stopPropagation()
    if (!menuOpen && menuBtnRef.current) {
      const rect = menuBtnRef.current.getBoundingClientRect()
      const openUp = rect.bottom + MENU_H > window.innerHeight
      setMenuPos({
        top: openUp ? rect.top - MENU_H - 4 : rect.bottom + 4,
        left: Math.max(8, rect.right - MENU_W),
      })
    }
    setMenuOpen((v) => !v)
  }

  const handleEdit = (e) => {
    e.stopPropagation()
    if (typeof row.id === 'number') {
      navigate(`/create/design/${row.id}`)
      return
    }
    setDraft(row)
    navigate('/create/design')
  }
  const handleClone = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
    setDraft(buildCloneDraft(row))
    navigate('/create/design', { state: { cloneFlow: true } })
  }
  const handleDelete = (e) => {
    e.stopPropagation()
    deleteMutation.mutate(row.id)
    setMenuOpen(false)
  }

  return (
    <div className="relative" ref={menuWrapRef}>
      <button
        ref={menuBtnRef}
        type="button"
        onClick={toggleMenu}
        className="w-8 h-8 rounded-[10px] border border-line text-ink-faint flex items-center justify-center hover:bg-canvas transition-colors"
        aria-label="More actions"
      >
        <MoreVertical size={14} />
      </button>
      {menuOpen && menuPos && (
        <div
          style={{ position: 'fixed', top: menuPos.top, left: menuPos.left }}
          className="w-44 bg-white rounded-[10px] shadow-pop border border-line py-1 z-50 animate-pop"
        >
          <button
            type="button"
            onClick={handleEdit}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink-soft hover:bg-canvas hover:text-ink"
          >
            <Pencil size={14} className="text-ink-faint" /> Edit Design
          </button>
          <button
            type="button"
            onClick={handleClone}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink-soft hover:bg-canvas hover:text-ink"
          >
            <Copy size={14} className="text-ink-faint" /> Clone
          </button>
          <div className="my-1 border-t border-line" />
          <button
            type="button"
            onClick={handleDelete}
            className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-danger hover:bg-red-50"
          >
            <Trash2 size={14} /> Delete
          </button>
        </div>
      )}
    </div>
  )
}

/* ─── Table row ──────────────────────────────────────────────────────── */
function QrRow({ row, onOpenModal }) {
  const qrRef = useRef(null)
  const typeLabel = normaliseType(row.qrType)
  const isDynamic = isDynamicRow(row)

  return (
    <tr
      className="border-b border-line last:border-0 text-sm hover:bg-primary/[0.025] cursor-pointer transition-colors group"
      onClick={() => onOpenModal(row)}
    >
      {/* Name + short URL (Dynamic QRs only) */}
      <td className="py-3.5 pl-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] border border-line/70 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            <QRView ref={qrRef} record={row} size={36} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate text-[13px]">
              {row.name}
            </div>
            {isDynamic && (
              <div className="flex items-center gap-1 mt-0.5">
                <span className="text-xs text-primary truncate">
                  {shortUrl(row.slug)}
                </span>
                <CopySlugButton slug={row.slug} />
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Type — content type (Website URL, Wi-Fi, …) + Dynamic/Static mode */}
      <td className="py-3.5 pr-4">
        <div className="flex flex-col items-start gap-1.5">
          <ContentType typeKey={row.typeKey} />
          <TypeBadge type={typeLabel} />
        </div>
      </td>

      {/* Edited on */}
      <td className="py-3.5 pr-4 text-xs text-ink-muted">
        {formatDate(row.editedOn)}
      </td>

      {/* Status — Dynamic QRs only */}
      <td className="py-3.5 pr-4">
        {isDynamic ? (
          <StatusIndicator status={row.status} className="text-xs" />
        ) : (
          <span className="text-ink-faint">—</span>
        )}
      </td>

      {/* Scans — Dynamic QRs only */}
      <td className="py-3.5 pr-4 text-sm font-bold text-ink">
        {isDynamic ? (
          row.scans > 0 ? (
            row.scans.toLocaleString()
          ) : (
            <span className="text-ink-faint font-normal">—</span>
          )
        ) : (
          <span className="text-ink-faint font-normal">—</span>
        )}
      </td>

      {/* Actions */}
      <td className="py-3.5 pr-4">
        <div
          className="flex items-center gap-1.5 justify-end"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Download — always visible */}
          <button
            type="button"
            onClick={() =>
              qrRef.current?.download('PNG', row.name || 'qr-code')
            }
            className="w-8 h-8 rounded-[10px] border border-line text-ink-faint flex items-center justify-center hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Download"
            title="Download PNG"
          >
            <Download size={14} />
          </button>

          {/* Three-dot menu */}
          <ActionMenu row={row} />
        </div>
      </td>
    </tr>
  )
}

/* ─── Mobile card (replaces the table row on small screens) ──────────── */
function QrCard({ row, onOpenModal }) {
  const qrRef = useRef(null)
  const typeLabel = normaliseType(row.qrType)
  const isDynamic = isDynamicRow(row)

  return (
    <div
      onClick={() => onOpenModal(row)}
      className="flex items-center gap-3 p-3 border-b border-line last:border-0 active:bg-primary/[0.03] cursor-pointer"
    >
      <div className="w-12 h-12 rounded-[10px] border border-line/70 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
        <QRView ref={qrRef} record={row} size={40} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-ink truncate text-[13px]">
          {row.name}
        </div>
        {isDynamic && (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="text-xs text-primary truncate">
              {shortUrl(row.slug)}
            </span>
            <CopySlugButton slug={row.slug} />
          </div>
        )}
        <div className="flex items-center gap-2 mt-1.5 min-w-0">
          <ContentType typeKey={row.typeKey} />
          {/* Surface an inactive QR here; the row is too narrow to show both,
              so the exceptional state takes the mode badge's slot. Static QRs
              have no active/inactive state, so always show the mode badge. */}
          {isDynamic && isInactiveStatus(row.status) ? (
            <StatusIndicator status={row.status} className="text-[11px]" />
          ) : (
            <TypeBadge type={typeLabel} short />
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          qrRef.current?.download('PNG', row.name || 'qr-code')
        }}
        className="w-9 h-9 rounded-[10px] border border-line text-ink-faint flex items-center justify-center shrink-0 active:bg-canvas"
        aria-label="Download"
      >
        <Download size={15} />
      </button>
    </div>
  )
}

/* ─── Grid card (card / gallery view) ────────────────────────────────── */
function QrGridCard({ row, onOpenModal }) {
  const qrRef = useRef(null)
  const typeLabel = normaliseType(row.qrType)
  const isDynamic = isDynamicRow(row)

  return (
    <div
      onClick={() => onOpenModal(row)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpenModal(row)
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`View details for ${row.name || 'QR code'}`}
      className="group flex flex-col rounded-[10px] border border-line bg-white p-4 cursor-pointer transition-all hover:border-primary/30 hover:shadow-card focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
    >
      {/* Top: content type + actions menu */}
      <div className="flex items-center justify-between gap-2">
        <ContentType typeKey={row.typeKey} />
        <div onClick={(e) => e.stopPropagation()}>
          <ActionMenu row={row} />
        </div>
      </div>

      {/* QR preview — inner box matches QRView size so static/dynamic fill evenly */}
      <div className="mt-3 flex justify-center">
        <div className="w-[108px] h-[108px] rounded-[10px] border border-line/70 bg-white flex items-center justify-center overflow-hidden shadow-sm">
          <QRView ref={qrRef} record={row} size={108} />
        </div>
      </div>

      {/* Name + short URL (Dynamic QRs only) */}
      <div className="mt-3 text-center min-w-0">
        <div className="font-semibold text-ink truncate text-sm">
          {row.name}
        </div>
        {isDynamic && (
          <div className="flex items-center justify-center gap-1 mt-1 min-w-0">
            <span className="text-xs text-primary truncate">
              {shortUrl(row.slug)}
            </span>
            <CopySlugButton slug={row.slug} />
          </div>
        )}
      </div>

      {/* Meta: mode (Dynamic/Static) · status · scans — status/scans are Dynamic-only */}
      <div className="mt-3 pt-3 border-t border-line flex items-center justify-between gap-2 text-[11px]">
        <TypeBadge type={typeLabel} />
        {isDynamic && (
          <span className="inline-flex items-center gap-2 shrink-0">
            <StatusIndicator status={row.status} />
            <span className="font-semibold text-ink">
              {row.scans > 0 ? row.scans.toLocaleString() : '—'}
              <span className="font-normal text-ink-faint"> scans</span>
            </span>
          </span>
        )}
      </div>

      {/* Download */}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          qrRef.current?.download('PNG', row.name || 'qr-code')
        }}
        className="mt-3 h-9 rounded-[10px] border border-line text-ink-soft text-xs font-bold flex items-center justify-center gap-1.5 hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
      >
        <Download size={14} /> Download
      </button>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-[10px] border border-line bg-white p-4">
      <div className="flex items-center justify-between">
        <div className="h-5 w-20 rounded-full shimmer" />
        <div className="h-8 w-8 rounded-[10px] shimmer" />
      </div>
      <div className="mt-3 flex justify-center">
        <div className="w-[108px] h-[108px] rounded-[10px] shimmer" />
      </div>
      <div className="mt-3 mx-auto h-4 w-3/4 rounded shimmer" />
      <div className="mt-2 mx-auto h-3 w-1/2 rounded shimmer" />
      <div className="mt-4 h-9 w-full rounded-[10px] shimmer" />
    </div>
  )
}

/* ─── Dashboard page ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { data: list = [], isLoading, isError, refetch } = useQrs()
  const deleteMutation = useDeleteQr()
  const statusMutation = useSetQrStatus()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [visibleCount, setVisibleCount] = useState(BATCH)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  // View mode — persisted across visits; defaults per device (table on mobile,
  // card on desktop) until the user makes an explicit choice.
  const [view, setView] = useState(() => {
    try {
      const stored = localStorage.getItem('liffto.dashboardView')
      return VIEWS.includes(stored) ? stored : defaultView()
    } catch {
      return defaultView()
    }
  })
  const sentinelRef = useRef(null)

  const changeView = (v) => {
    setView(v)
    try {
      localStorage.setItem('liffto.dashboardView', v)
    } catch {
      /* ignore storage failures */
    }
  }

  useEffect(() => {
    setVisibleCount(BATCH)
  }, [query, filter])

  const q = query.trim().toLowerCase()
  const derived = list.filter((r) => {
    const matchesQuery =
      !q ||
      r.name.toLowerCase().includes(q) ||
      (r.url || '').toLowerCase().includes(q) ||
      (r.slug || '').toLowerCase().includes(q)
    const matchesFilter = filter === 'All' || normaliseType(r.qrType) === filter
    return matchesQuery && matchesFilter
  })

  const total = derived.length
  const visible = derived.slice(0, visibleCount)
  const hasMore = visibleCount < total

  useEffect(() => {
    if (!hasMore || loadingMore) return undefined
    let triggered = false
    const loadMore = () => {
      if (triggered) return
      triggered = true
      setLoadingMore(true)
      window.setTimeout(() => {
        setVisibleCount((c) => c + BATCH)
        setLoadingMore(false)
      }, 600)
    }
    const check = () => {
      const el = sentinelRef.current
      if (el && el.getBoundingClientRect().top <= window.innerHeight + 160)
        loadMore()
    }
    check()
    window.addEventListener('scroll', check, { passive: true })
    const poll = window.setInterval(check, 300)
    return () => {
      window.removeEventListener('scroll', check)
      window.clearInterval(poll)
    }
  }, [hasMore, loadingMore, visibleCount, total])

  const handleEditModal = () => {
    if (!selectedRow) return
    if (typeof selectedRow.id === 'number') {
      setSelectedRow(null)
      navigate(`/create/design/${selectedRow.id}`)
      return
    }
    setDraft(selectedRow)
    setSelectedRow(null)
    navigate('/create/design')
  }

  const handleCloneModal = (row) => {
    setDraft(buildCloneDraft(row))
    navigate('/create/design', { state: { cloneFlow: true } })
  }

  const handleDeleteModal = async (id) => {
    await deleteMutation.mutateAsync(id)
  }

  const handleToggleStatus = (id, status) => {
    // UI: keep the open modal / list row status in sync.
    setSelectedRow((prev) =>
      prev && prev.id === id ? { ...prev, status } : prev,
    )

    // Best-effort save — UI already updated above.
    const row =
      (selectedRow && selectedRow.id === id ? selectedRow : null) ||
      list.find((r) => r.id === id)
    if (!row?.typeKey || typeof id !== 'number') return
    statusMutation.mutate({ id, typeKey: row.typeKey, status })
  }

  // Derived in src/lib/dashboardStats.js so the figures can be tested without
  // signing in. See the note there on why the two "vs last week" style
  // subtitles this replaced could not be made real.
  // Not `total` — that name is taken further up by the count of the *filtered*
  // rows behind the table's footer. This one counts everything the account has.
  const { total: totalCodes, totalScans, dynamicCount, codesSub, scansSub } =
    dashboardStats(list)

  const STATS = [
    {
      label: 'Total QR Codes',
      value: totalCodes,
      sub: codesSub,
      icon: QrCode,
      cls: 'bg-primary/10 text-primary',
      ring: 'ring-primary/15',
    },
    {
      label: 'Total Scans',
      value: totalScans.toLocaleString(),
      sub: scansSub,
      icon: BarChart2,
      cls: 'bg-amber-50 text-amber-500',
      ring: 'ring-amber-100',
    },
    {
      label: 'Dynamic QR',
      value: dynamicCount,
      sub: 'real-time redirects',
      icon: Zap,
      cls: 'bg-success/10 text-success',
      ring: 'ring-success/15',
    },
  ]

  return (
    <Layout breadcrumb="My QR Codes">
      {list
        .filter((row) => row.dynamic && row.slug)
        .map((row) => (
          <QrScanSubscriber key={row.slug} slug={row.slug} />
        ))}
      {/* Stats — stacked on mobile, single bar on desktop */}
      <div className="bg-white rounded-[10px] shadow-card flex flex-col divide-y divide-line sm:flex-row sm:divide-y-0 sm:divide-x mb-5">
        {STATS.map(({ label, value, sub, icon: Icon, cls }) => (
          <div
            key={label}
            className="flex-1 flex items-center gap-3 px-5 py-3.5 min-w-0"
          >
            <div
              className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 ${cls}`}
            >
              <Icon size={15} />
            </div>
            <div className="min-w-0">
              <p className="text-[11px] text-ink-muted leading-none mb-1 truncate">
                {label}
              </p>
              <div className="flex items-baseline gap-2 flex-wrap">
                <span className="text-xl font-bold text-ink leading-none">
                  {value}
                </span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-ink-faint">
                  {sub}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Create QR — mobile only (desktop has it in the top bar) */}
      <button
        type="button"
        onClick={() => {
          clearDraft()
          navigate('/create')
        }}
        className="md:hidden w-full mb-4 h-11 rounded-[10px] bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors shadow-sm shadow-primary/25"
      >
        <Plus size={17} strokeWidth={2.5} /> Create QR Code
      </button>

      {/* Table card */}
      <div className="bg-white rounded-[10px] shadow-card">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 px-4 py-3.5 border-b border-line sm:flex-row sm:items-center">
          {/* Search — on mobile the view toggle sits beside it so the filter
              row below gets the full width and doesn't feel cramped */}
          <div className="flex items-center gap-2 sm:flex-1">
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-faint pointer-events-none"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by name, URL or slug…"
                className="w-full pl-10 h-10 rounded-[10px] bg-canvas border border-transparent focus:border-primary focus:bg-white outline-none text-sm text-ink placeholder:text-ink-faint transition"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink transition-colors"
                >
                  <X size={14} />
                </button>
              )}
            </div>
            <ViewToggle
              view={view}
              onChange={changeView}
              className="sm:hidden"
            />
          </div>

          {/* Filters — full-width evenly-spaced pills on mobile, auto on desktop */}
          <div className="flex items-center gap-1.5 sm:shrink-0">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`h-9 flex-1 whitespace-nowrap px-3 rounded-[10px] text-xs font-bold transition-colors sm:flex-none sm:px-3.5 ${
                  filter === f
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'bg-canvas text-ink-muted hover:bg-line/60'
                }`}
              >
                {/* "QR" is redundant in a QR app — drop it on mobile to keep
                    each pill on one line; show the full label on desktop */}
                <span className="sm:hidden">{f.replace(' QR', '')}</span>
                <span className="hidden sm:inline">{f}</span>
              </button>
            ))}
          </div>

          {/* View toggle — desktop only (mobile copy lives beside search) */}
          <ViewToggle
            view={view}
            onChange={changeView}
            className="hidden sm:flex"
          />
        </div>

        {isLoading ? (
          /* Loading — skeletons matching the active view */
          view === 'card' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 p-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <SkeletonCard key={`sk-${i}`} />
              ))}
            </div>
          ) : (
            <div className="divide-y divide-line">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={`sk-${i}`} className="flex items-center gap-3 p-3">
                  <div className="h-11 w-11 shrink-0 rounded-[10px] shimmer" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-40 shimmer rounded" />
                    <div className="h-3 w-24 shimmer rounded" />
                  </div>
                </div>
              ))}
            </div>
          )
        ) : isError ? (
          /* Error state with retry */
          <div className="py-16 px-4 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-[10px] bg-danger/10 flex items-center justify-center">
                <QrCode size={24} className="text-danger" />
              </div>
              <div>
                <p className="font-bold text-ink mb-1">
                  Couldn&apos;t load your QR codes
                </p>
                <p className="text-sm text-ink-muted max-w-[240px] mx-auto leading-relaxed">
                  Something went wrong fetching your library. Please try again.
                </p>
              </div>
              <button
                type="button"
                onClick={() => refetch()}
                className="mt-1 bg-primary text-white rounded-[10px] px-5 h-10 text-sm font-bold hover:bg-primary-600 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        ) : total === 0 ? (
          /* Empty state (shared) */
          <div className="py-16 px-4 text-center">
            <div className="flex flex-col items-center gap-3">
              <div className="w-14 h-14 rounded-[10px] bg-primary/8 flex items-center justify-center">
                <QrCode size={24} className="text-primary" />
              </div>
              <div>
                <p className="font-bold text-ink mb-1">
                  {q || filter !== 'All'
                    ? 'No matching QR codes'
                    : 'No QR codes yet'}
                </p>
                <p className="text-sm text-ink-muted max-w-[220px] mx-auto leading-relaxed">
                  {q || filter !== 'All'
                    ? 'Try adjusting your search or filter'
                    : 'Create your first QR code to get started'}
                </p>
              </div>
              {!q && filter === 'All' && (
                <button
                  type="button"
                  onClick={() => {
                    clearDraft()
                    navigate('/create')
                  }}
                  className="mt-1 bg-primary text-white rounded-[10px] px-5 h-10 text-sm font-bold flex items-center gap-2 hover:bg-primary-600 transition-colors shadow-sm shadow-primary/25"
                >
                  <Plus size={16} /> Create QR Code
                </button>
              )}
            </div>
          </div>
        ) : view === 'card' ? (
          /* Card / gallery view (default) — responsive grid on all screens */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-3 p-4">
            {visible.map((row) => (
              <QrGridCard key={row.id} row={row} onOpenModal={setSelectedRow} />
            ))}
            {loadingMore &&
              Array.from({
                length: Math.min(4, total - visibleCount),
              }).map((_, i) => <SkeletonCard key={`skc-${i}`} />)}
          </div>
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    {[
                      { label: 'Name', cls: 'pl-4' },
                      { label: 'Type', cls: '' },
                      { label: 'Edited On', cls: '' },
                      { label: 'Status', cls: '' },
                      { label: 'Scans', cls: '' },
                    ].map(({ label, cls }) => (
                      <th
                        key={label}
                        className={`py-3 pr-4 ${cls} text-left text-[11px] font-bold text-ink-muted uppercase tracking-wide`}
                      >
                        <span className="inline-flex items-center gap-1">
                          {label}
                          <ChevronsUpDown
                            size={11}
                            className="text-ink-faint"
                          />
                        </span>
                      </th>
                    ))}
                    <th className="py-3 pr-4" />
                  </tr>
                </thead>
                <tbody>
                  {visible.map((row) => (
                    <QrRow
                      key={row.id}
                      row={row}
                      onOpenModal={setSelectedRow}
                    />
                  ))}
                  {loadingMore &&
                    Array.from({
                      length: Math.min(3, total - visibleCount),
                    }).map((_, i) => <SkeletonRow key={`sk-${i}`} />)}
                </tbody>
              </table>
            </div>

            {/* Mobile card list */}
            <div className="md:hidden">
              {visible.map((row) => (
                <QrCard key={row.id} row={row} onOpenModal={setSelectedRow} />
              ))}
              {loadingMore && (
                <div className="py-4 text-center text-xs text-ink-faint">
                  Loading more…
                </div>
              )}
            </div>
          </>
        )}

        <div ref={sentinelRef} className="h-1 w-full" />
        {total > 0 && (
          <div className="py-3 px-4 text-center text-xs text-ink-faint border-t border-line">
            {hasMore
              ? `Showing ${visible.length} of ${total} QR codes`
              : `All ${total} QR code${total !== 1 ? 's' : ''} · You're all caught up`}
          </div>
        )}
      </div>

      {selectedRow && (
        <QrModal
          row={selectedRow}
          onClose={() => setSelectedRow(null)}
          onDelete={handleDeleteModal}
          onEdit={handleEditModal}
          onToggleStatus={handleToggleStatus}
          onClone={handleCloneModal}
        />
      )}
    </Layout>
  )
}
