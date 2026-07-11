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
  TrendingUp,
  ExternalLink,
} from 'lucide-react'
import { deleteQR, duplicateQR, setDraft, clearDraft, shortUrl, formatDate, copyToClipboard } from '../lib/store'
import { useDeleteQr, useQrs } from '../hooks/useQrs'
import { DOWNLOAD_FORMATS } from '../lib/qr'
import QRView from '../components/QRView'
import Layout from '../components/Layout'

const normaliseType = (t) => (t === 'Statistic' ? 'Static QR' : t)

const FILTERS = ['All', 'Dynamic QR', 'Static QR']
const BATCH = 8

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
function QrModal({ row, onClose, onDelete, onEdit }) {
  const qrRef = useRef(null)
  const [urlCopied, setUrlCopied] = useState(false)
  const [format, setFormat] = useState('PNG')
  const [fmtOpen, setFmtOpen] = useState(false)
  const fmtWrapRef = useRef(null)
  const typeLabel = normaliseType(row.qrType)

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
    >
      <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-[480px] animate-pop overflow-hidden">
        {/* ── Header ── */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <h2 className="font-bold text-ink text-[15px]">QR Details</h2>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-ink-faint hover:bg-canvas hover:text-ink transition-colors"
          >
            <X size={16} />
          </button>
        </div>

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
              <span
                className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  typeLabel === 'Dynamic QR'
                    ? 'bg-primary/10 text-primary'
                    : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {typeLabel}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-success">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                Active
              </span>
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

          {/* Short URL */}
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

          {/* Stats row */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            {[
              {
                label: 'Scans',
                value: row.scans > 0 ? row.scans.toLocaleString() : '—',
              },
              { label: 'Edited', value: formatDate(row.editedOn) },
              { label: 'Status', value: 'Active', green: true },
            ].map(({ label, value, green }) => (
              <div
                key={label}
                className="bg-canvas rounded-[10px] px-3 py-2.5 text-center"
              >
                <p className="text-[10px] font-bold text-ink-faint uppercase tracking-wide mb-1">
                  {label}
                </p>
                <p
                  className={`text-sm font-bold ${green ? 'text-success' : 'text-ink'}`}
                >
                  {value}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="px-5 pb-5 flex flex-col sm:flex-row gap-2.5">
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
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 h-10 rounded-[10px] bg-primary text-white text-sm font-bold flex items-center justify-center gap-2 hover:bg-primary-600 transition-colors shadow-sm shadow-primary/25"
            >
              <Pencil size={14} /> Edit Design
            </button>
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

/* ─── Table row ──────────────────────────────────────────────────────── */
function QrRow({ row, onRefresh, onOpenModal }) {
  const navigate = useNavigate()
  const qrRef = useRef(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPos, setMenuPos] = useState(null)
  const [rowCopied, setRowCopied] = useState(false)
  const menuWrapRef = useRef(null)
  const menuBtnRef = useRef(null)
  const typeLabel = normaliseType(row.qrType)

  useEffect(() => {
    if (!menuOpen) return undefined
    const h = (e) => {
      if (menuWrapRef.current && !menuWrapRef.current.contains(e.target))
        setMenuOpen(false)
    }
    // Close on scroll too — the menu is viewport-fixed so it won't
    // follow the row if the table (or page) scrolls underneath it.
    const closeOnScroll = () => setMenuOpen(false)
    document.addEventListener('mousedown', h)
    window.addEventListener('scroll', closeOnScroll, true)
    return () => {
      document.removeEventListener('mousedown', h)
      window.removeEventListener('scroll', closeOnScroll, true)
    }
  }, [menuOpen])

  // The table wrapper uses overflow-x-auto, which per the CSS overflow spec
  // implicitly forces overflow-y to auto too — any absolutely-positioned
  // dropdown that extends past the table's own box gets clipped. Rendering
  // the menu with position:fixed (computed from the button's rect) escapes
  // that clipping since fixed elements lay out against the viewport.
  const MENU_W = 176 // w-44
  const MENU_H = 122 // ~3 items + divider
  const toggleMenu = () => {
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

  const handleEdit = () => {
    if (typeof row.id === 'number') {
      navigate(`/create/design/${row.id}`)
      return
    }
    setDraft(row)
    navigate('/create/design')
  }
  const handleDuplicate = () => {
    duplicateQR(row.id)
    setMenuOpen(false)
    onRefresh()
  }
  const handleDelete = async () => {
    if (typeof row.id === 'number') {
      await deleteWebsite(row.id)
    } else {
      deleteQR(row.id)
    }
    setMenuOpen(false)
    onRefresh()
  }

  const copySlug = (e) => {
    e.stopPropagation()
    copyToClipboard(shortUrl(row.slug))
    setRowCopied(true)
    setTimeout(() => setRowCopied(false), 1500)
  }

  return (
    <tr
      className="border-b border-line last:border-0 text-sm hover:bg-primary/[0.025] cursor-pointer transition-colors group"
      onClick={() => onOpenModal(row)}
    >
      {/* Name + short URL */}
      <td className="py-3.5 pl-4 pr-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-[10px] border border-line/70 bg-white p-1 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
            <QRView ref={qrRef} record={row} size={36} />
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-ink truncate text-[13px]">
              {row.name}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-xs text-primary truncate">
                {shortUrl(row.slug)}
              </span>
              <button
                type="button"
                onClick={copySlug}
                className={`shrink-0 transition-colors ${rowCopied ? 'text-success' : 'text-ink-faint hover:text-primary'}`}
                title={rowCopied ? 'Copied!' : 'Copy short URL'}
              >
                {rowCopied ? <Check size={12} /> : <Copy size={12} />}
              </button>
            </div>
          </div>
        </div>
      </td>

      {/* Type badge */}
      <td className="py-3.5 pr-4">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
            typeLabel === 'Dynamic QR'
              ? 'bg-primary/10 text-primary'
              : 'bg-emerald-50 text-emerald-600'
          }`}
        >
          {typeLabel}
        </span>
      </td>

      {/* Edited on */}
      <td className="py-3.5 pr-4 text-xs text-ink-muted">
        {formatDate(row.editedOn)}
      </td>

      {/* Status */}
      <td className="py-3.5 pr-4">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-success">
          <span className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
          Active
        </span>
      </td>

      {/* Scans */}
      <td className="py-3.5 pr-4 text-sm font-bold text-ink">
        {row.scans > 0 ? (
          row.scans.toLocaleString()
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
            onClick={() => qrRef.current?.download('PNG', row.name)}
            className="w-8 h-8 rounded-[10px] border border-line text-ink-faint flex items-center justify-center hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-colors"
            aria-label="Download"
            title="Download PNG"
          >
            <Download size={14} />
          </button>

          {/* Three-dot menu */}
          <div className="relative" ref={menuWrapRef}>
            <button
              ref={menuBtnRef}
              type="button"
              onClick={toggleMenu}
              className="w-8 h-8 rounded-[10px] border border-line text-ink-faint flex items-center justify-center hover:bg-canvas transition-colors"
            >
              <MoreVertical size={14} />
            </button>
            {menuOpen && menuPos && (
              <div
                style={{
                  position: 'fixed',
                  top: menuPos.top,
                  left: menuPos.left,
                }}
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
                  onClick={handleDuplicate}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-ink-soft hover:bg-canvas hover:text-ink"
                >
                  <Copy size={14} className="text-ink-faint" /> Duplicate
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
        </div>
      </td>
    </tr>
  )
}

/* ─── Mobile card (replaces the table row on small screens) ──────────── */
function QrCard({ row, onOpenModal }) {
  const qrRef = useRef(null)
  const [rowCopied, setRowCopied] = useState(false)
  const typeLabel = normaliseType(row.qrType)

  const copySlug = (e) => {
    e.stopPropagation()
    copyToClipboard(shortUrl(row.slug))
    setRowCopied(true)
    setTimeout(() => setRowCopied(false), 1500)
  }

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
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-xs text-primary truncate">
            {shortUrl(row.slug)}
          </span>
          <button
            type="button"
            onClick={copySlug}
            className={`shrink-0 transition-colors ${rowCopied ? 'text-success' : 'text-ink-faint'}`}
            aria-label={rowCopied ? 'Copied' : 'Copy short URL'}
          >
            {rowCopied ? <Check size={12} /> : <Copy size={12} />}
          </button>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span
            className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
              typeLabel === 'Dynamic QR'
                ? 'bg-primary/10 text-primary'
                : 'bg-emerald-50 text-emerald-600'
            }`}
          >
            {typeLabel}
          </span>
          <span className="text-[11px] text-ink-faint">
            {row.scans > 0
              ? `${row.scans.toLocaleString()} scans`
              : 'No scans yet'}
          </span>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          qrRef.current?.download('PNG', row.name)
        }}
        className="w-9 h-9 rounded-[10px] border border-line text-ink-faint flex items-center justify-center shrink-0 active:bg-canvas"
        aria-label="Download"
      >
        <Download size={15} />
      </button>
    </div>
  )
}

/* ─── Dashboard page ─────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { data: list = [], isLoading, refetch } = useQrs()
  const deleteQrMutation = useDeleteQr()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('All')
  const [visibleCount, setVisibleCount] = useState(BATCH)
  const [loadingMore, setLoadingMore] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)
  const sentinelRef = useRef(null)

  const refresh = () => {
    refetch()
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

  const handleDeleteModal = async (id) => {
    if (typeof id === 'number') {
      await deleteQrMutation.mutateAsync(id)
    } else {
      deleteQR(id)
    }
    refresh()
  }

  const totalScans = list.reduce((s, r) => s + (r.scans || 0), 0)
  const dynamicCount = list.filter(
    (r) => normaliseType(r.qrType) === 'Dynamic QR',
  ).length

  const STATS = [
    {
      label: 'Total QR Codes',
      value: list.length,
      sub: '+2 this week',
      up: true,
      icon: QrCode,
      cls: 'bg-primary/10 text-primary',
      ring: 'ring-primary/15',
    },
    {
      label: 'Total Scans',
      value: totalScans.toLocaleString(),
      sub: '+18% vs last week',
      up: true,
      icon: BarChart2,
      cls: 'bg-amber-50 text-amber-500',
      ring: 'ring-amber-100',
    },
    {
      label: 'Dynamic QR',
      value: dynamicCount,
      sub: 'real-time redirects',
      up: null,
      icon: Zap,
      cls: 'bg-success/10 text-success',
      ring: 'ring-success/15',
    },
  ]

  return (
    <Layout breadcrumb="My QR Codes">
      {/* Stats — stacked on mobile, single bar on desktop */}
      <div className="bg-white rounded-[10px] shadow-card flex flex-col divide-y divide-line sm:flex-row sm:divide-y-0 sm:divide-x mb-5">
        {STATS.map(({ label, value, sub, up, icon: Icon, cls }) => (
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
                <span
                  className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${up ? 'text-success' : 'text-ink-faint'}`}
                >
                  {up && <TrendingUp size={10} className="shrink-0" />}
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
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-4 py-3.5 border-b border-line">
          <div className="flex-1 relative">
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
          <div className="flex items-center gap-1.5 shrink-0">
            {FILTERS.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                className={`h-9 px-3.5 rounded-[10px] text-xs font-bold transition-colors ${
                  filter === f
                    ? 'bg-primary text-white shadow-sm shadow-primary/25'
                    : 'bg-canvas text-ink-muted hover:bg-line/60'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full">
              <tbody>
                {Array.from({ length: 4 }).map((_, i) => (
                  <SkeletonRow key={`loading-${i}`} />
                ))}
              </tbody>
            </table>
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
        ) : (
          <>
            {/* Desktop / tablet table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-line">
                    {[
                      { label: 'Name', cls: 'pl-4' },
                      { label: 'QR Type', cls: '' },
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
                      onRefresh={refresh}
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
        />
      )}
    </Layout>
  )
}
