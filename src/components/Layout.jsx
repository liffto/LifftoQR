import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Award,
  Code2,
  HelpCircle,
  LogOut,
  Bell,
  Plus,
  QrCode,
  CreditCard,
  Info,
  TrendingUp,
  CheckCheck,
  Check,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { clearDraft } from '../lib/store'
import {
  getDisplayName,
  getInitials,
  resolvePictureUrl,
} from '../utils/userDisplay'

/* ── Brand mark (white, for dark sidebar) ───────────────────────── */
function LogoMark() {
  return (
    <svg
      width="30"
      height="30"
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0"
        y="0"
        width="15"
        height="15"
        rx="3.5"
        fill="white"
        opacity="0.95"
      />
      <rect
        x="21"
        y="0"
        width="15"
        height="15"
        rx="3.5"
        fill="white"
        opacity="0.95"
      />
      <rect
        x="0"
        y="21"
        width="15"
        height="15"
        rx="3.5"
        fill="white"
        opacity="0.95"
      />
      <rect
        x="21"
        y="21"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.95"
      />
      <rect
        x="30"
        y="21"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.95"
      />
      <rect
        x="21"
        y="30"
        width="6"
        height="6"
        rx="1.5"
        fill="white"
        opacity="0.95"
      />
    </svg>
  )
}

/* ── Sidebar nav item with tooltip ──────────────────────────────── */
function SideItem({ icon: Icon, label, active, danger, onClick }) {
  return (
    <div className="relative group flex items-center justify-center">
      <button
        type="button"
        onClick={onClick}
        className={`w-10 h-10 rounded-[10px] flex items-center justify-center transition-all duration-200 ${
          danger
            ? 'text-white/25 hover:bg-red-500/15 hover:text-red-400'
            : active
              ? 'bg-primary/40 text-white shadow-[0_0_22px_rgba(27,89,245,0.45)]'
              : 'text-white/35 hover:bg-white/8 hover:text-white/75'
        }`}
        aria-label={label}
      >
        <Icon size={18} strokeWidth={active ? 2.5 : 1.8} />
      </button>

      {/* Tooltip */}
      <div
        className="pointer-events-none absolute left-[calc(100%+14px)] top-1/2 -translate-y-1/2 z-[100]
          opacity-0 group-hover:opacity-100 scale-95 group-hover:scale-100
          transition-all duration-150"
      >
        <div
          className="bg-[#1c2540] border border-white/10 text-white text-[12px] font-medium
          px-3 py-1.5 rounded-[10px] whitespace-nowrap shadow-xl shadow-black/30"
        >
          {label}
        </div>
        <div
          className="absolute right-full top-1/2 -translate-y-1/2
          border-t-[5px] border-t-transparent
          border-b-[5px] border-b-transparent
          border-r-[5px] border-r-[#1c2540]"
        />
      </div>
    </div>
  )
}

/* ── Mobile bottom-nav tab ──────────────────────────────────────── */
function BottomTab({ icon: Icon, label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors ${
        active ? 'text-primary' : 'text-ink-faint'
      }`}
      aria-label={label}
    >
      <Icon size={21} strokeWidth={active ? 2.4 : 1.9} />
      <span className="text-[10px] font-semibold leading-none">{label}</span>
    </button>
  )
}

/* ── Nav items config ────────────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: 'My QR Codes',
    short: 'Codes',
    icon: LayoutGrid,
    path: '/dashboard',
  },
  { label: 'Subscription', short: 'Plans', icon: Award, path: '/payment' },
  { label: 'Integration', short: 'Connect', icon: Code2, path: '/integration' },
  { label: 'FAQ', short: 'Help', icon: HelpCircle, path: '/faq' },
]

/* ── Notifications ───────────────────────────────────────────────── */
const INIT_NOTIFS = [
  {
    id: 1,
    icon: QrCode,
    bg: 'bg-primary/10',
    fg: 'text-primary',
    title: 'QR Code Scanned',
    body: '"www.cyberdine.in" was scanned 12 times today.',
    time: '2 min ago',
    day: 'Today',
    read: false,
  },
  {
    id: 2,
    icon: QrCode,
    bg: 'bg-primary/10',
    fg: 'text-primary',
    title: 'First Scan!',
    body: '"liffto-qr.vercel.app/m7c0YZ" received its very first scan!',
    time: '1 hr ago',
    day: 'Today',
    read: false,
  },
  {
    id: 3,
    icon: CreditCard,
    bg: 'bg-amber-50',
    fg: 'text-amber-500',
    title: 'Upgrade to Pro',
    body: "You've used 4 of 5 QR codes. Upgrade for unlimited codes.",
    time: '3 hr ago',
    day: 'Today',
    read: false,
  },
  {
    id: 4,
    icon: Info,
    bg: 'bg-violet-50',
    fg: 'text-violet-500',
    title: 'New Feature: Frames',
    body: 'Add custom frames and call-to-action labels to your QRs.',
    time: 'Yesterday',
    day: 'Yesterday',
    read: true,
  },
  {
    id: 5,
    icon: TrendingUp,
    bg: 'bg-success/10',
    fg: 'text-success',
    title: 'Weekly Summary',
    body: 'Your QR codes received 340 scans — up 18% from last week.',
    time: '2 days ago',
    day: 'Earlier',
    read: true,
  },
  {
    id: 6,
    icon: Info,
    bg: 'bg-violet-50',
    fg: 'text-violet-500',
    title: 'Welcome to Liffto!',
    body: 'Get started by creating your first QR code in 30 seconds.',
    time: '3 days ago',
    day: 'Earlier',
    read: true,
  },
]

function NotificationDropdown({ onClose }) {
  const [items, setItems] = useState(INIT_NOTIFS)
  const unread = items.filter((n) => !n.read).length
  const markAll = () => setItems((p) => p.map((n) => ({ ...n, read: true })))
  const markOne = (id) =>
    setItems((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)))
  const groups = ['Today', 'Yesterday', 'Earlier']
    .map((day) => ({ day, items: items.filter((n) => n.day === day) }))
    .filter((g) => g.items.length)

  return (
    <div className="fixed left-3 right-3 top-[64px] sm:absolute sm:inset-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] bg-white rounded-[10px] shadow-pop border border-line overflow-hidden z-50 animate-pop">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-ink text-sm">Notifications</span>
          {unread > 0 && (
            <span className="bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
              {unread}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unread > 0 && (
            <button
              onClick={markAll}
              className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
            >
              <CheckCheck size={13} /> Mark all read
            </button>
          )}
          <button
            onClick={onClose}
            className="w-6 h-6 rounded-[10px] flex items-center justify-center text-ink-faint hover:bg-canvas transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-[420px] overflow-y-auto">
        {groups.map(({ day, items: gItems }) => (
          <div key={day}>
            <div className="px-4 py-1.5 bg-canvas/70 border-b border-line">
              <p className="text-[10px] font-bold text-ink-faint uppercase tracking-widest">
                {day}
              </p>
            </div>
            {gItems.map((n) => {
              const Icon = n.icon
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOne(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-canvas/60 transition-colors border-b border-line/50 last:border-0 ${!n.read ? 'bg-primary/[0.02]' : ''}`}
                >
                  <div
                    className={`w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${n.bg} ${n.fg}`}
                  >
                    <Icon size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`text-[13px] leading-snug ${!n.read ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-ink-faint shrink-0 tabular-nums">
                        {n.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-ink-muted mt-0.5 leading-relaxed">
                      {n.body}
                    </p>
                  </div>
                  {!n.read && (
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </button>
              )
            })}
          </div>
        ))}
        {unread === 0 && items.every((n) => n.read) && (
          <div className="py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-[10px] bg-success/10 flex items-center justify-center">
              <Check size={18} className="text-success" />
            </div>
            <p className="text-sm font-medium text-ink-soft">
              You're all caught up!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Layout ──────────────────────────────────────────────────────── */
export default function Layout({ children, breadcrumb }) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  const { user, logout } = useAuth()
  const displayName = getDisplayName(user)
  const initials = getInitials(user)
  const pictureUrl = resolvePictureUrl(user?.picture, user?.pictureCacheKey)
  const unreadCount = INIT_NOTIFS.filter((n) => !n.read).length

  const handleCreate = () => {
    clearDraft()
    navigate('/create')
  }

  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  useEffect(() => {
    if (!notifOpen) return
    const h = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target))
        setNotifOpen(false)
    }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [notifOpen])

  useEffect(() => {
    if (!notifOpen) return
    const h = (e) => {
      if (e.key === 'Escape') setNotifOpen(false)
    }
    document.addEventListener('keydown', h)
    return () => document.removeEventListener('keydown', h)
  }, [notifOpen])

  return (
    <div className="flex min-h-screen bg-canvas">
      {/* ── SIDEBAR (icon rail, dark) ──────────────────────────── */}
      <aside
        className="hidden md:flex w-[64px] shrink-0 sticky top-0 h-screen z-30 flex-col items-center py-5 gap-0"
        style={{
          background:
            'linear-gradient(170deg, #131c35 0%, #0e1628 55%, #09101e 100%)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Logo mark */}
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="w-10 h-10 rounded-[10px] flex items-center justify-center hover:bg-white/8 transition-colors mb-2"
          aria-label="Home"
        >
          <LogoMark />
        </button>

        {/* Top divider */}
        <div className="w-7 h-px bg-white/8 my-3" />

        {/* Primary nav */}
        <nav className="flex flex-col items-center gap-1.5 flex-1">
          {NAV_ITEMS.map(({ label, icon, path }) => (
            <SideItem
              key={path}
              icon={icon}
              label={label}
              active={pathname === path}
              onClick={() => navigate(path)}
            />
          ))}
        </nav>

        {/* Bottom divider */}
        <div className="w-7 h-px bg-white/8 my-3" />

        {/* Logout */}
        <SideItem
          icon={LogOut}
          label="Sign Out"
          danger
          onClick={() => {
            clearDraft()
            logout()
          }}
        />
      </aside>

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP APP BAR */}
        <header
          className="h-[60px] bg-white shrink-0 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6"
          style={{
            borderBottom: '1px solid rgba(0,0,0,0.07)',
            boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
          }}
        >
          {/* Left — greeting */}
          <div className="flex flex-col justify-center gap-2">
            <p className="text-[14px] font-bold text-ink leading-none">
              {greeting}
            </p>
            <p className="text-[12px] text-ink-faint leading-none">
              Welcome to Liffto QR Generator
            </p>
          </div>

          {/* Right — actions */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                aria-label="Notifications"
                className={`relative w-9 h-9 rounded-[10px] border flex items-center justify-center transition-all ${
                  notifOpen
                    ? 'border-primary text-primary bg-primary/5'
                    : 'border-line text-ink-muted hover:border-ink-muted/40 hover:bg-canvas'
                }`}
              >
                <Bell size={16} />
                {unreadCount > 0 && (
                  <span className="w-[7px] h-[7px] bg-red-500 rounded-full absolute top-[7px] right-[7px] ring-[1.5px] ring-white" />
                )}
              </button>
              {notifOpen && (
                <NotificationDropdown onClose={() => setNotifOpen(false)} />
              )}
            </div>

            {/* Divider */}
            <div className="hidden sm:block w-px h-6 bg-line mx-0.5" />

            {/* User chip */}
            <button
              type="button"
              onClick={() => navigate('/account')}
              className="flex items-center gap-2 h-9 pl-1.5 pr-1.5 sm:pr-3 rounded-[10px] border border-line hover:bg-canvas transition-colors"
            >
              {pictureUrl ? (
                <img
                  key={pictureUrl}
                  src={pictureUrl}
                  alt={displayName}
                  className="w-6 h-6 rounded-full object-cover shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-[#7c3aed] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                  {initials}
                </div>
              )}
              <span className="hidden sm:block text-xs font-semibold text-ink-soft leading-none">
                {displayName}
              </span>
            </button>

            {/* Create QR — desktop only (mobile uses bottom-nav FAB) */}
            <button
              type="button"
              onClick={handleCreate}
              className="hidden md:flex h-9 pl-3 pr-4 rounded-[10px] bg-primary text-white text-sm font-semibold items-center gap-1.5 hover:bg-[#1549d4] transition-colors shadow-sm shadow-primary/30"
            >
              <Plus size={15} strokeWidth={2.5} />
              Create QR
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <div className="p-4 sm:p-6 pb-24 md:pb-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV (with center Create FAB) ──────────── */}
      <nav
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-line flex items-stretch px-1"
        style={{
          boxShadow: '0 -2px 14px rgba(16,24,40,0.07)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV_ITEMS.slice(0, 2).map(({ short, icon, path }) => (
          <BottomTab
            key={path}
            icon={icon}
            label={short}
            active={pathname === path}
            onClick={() => navigate(path)}
          />
        ))}

        {/* Center Create FAB */}
        <div className="flex-1 flex justify-center">
          <button
            type="button"
            onClick={handleCreate}
            aria-label="Create QR"
            className="-mt-5 w-14 h-14 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-white active:scale-95 transition-transform"
          >
            <Plus size={24} strokeWidth={2.5} />
          </button>
        </div>

        {NAV_ITEMS.slice(2).map(({ short, icon, path }) => (
          <BottomTab
            key={path}
            icon={icon}
            label={short}
            active={pathname === path}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>
    </div>
  )
}
