import { useState, useRef, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutGrid,
  Award,
  Code2,
  HelpCircle,
  FolderOpen,
  LogOut,
  Bell,
  Plus,
  QrCode,
  CreditCard,
  Info,
  CheckCheck,
  Check,
  X,
  Sun,
  Moon,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../hooks/useTheme'
import LifftoMark from './LifftoMark'
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../hooks/useNotifications'
import { timeAgo, dayBucket } from '../lib/timeAgo'
import { clearDraft } from '../lib/store'
import { prefetchSignedInRoutes } from '../lib/routePrefetch'
import {
  getDisplayName,
  getInitials,
  resolvePictureUrl,
} from '../utils/userDisplay'

/* ── Brand mark (white, for dark sidebar) ───────────────────────── */
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
      aria-label={label}
      aria-current={active ? 'page' : undefined}
      className="group relative flex min-w-0 flex-1 flex-col items-center gap-1 py-2"
    >
      {/* A tinted tile behind the icon, not colour alone: a 10px label going
          from grey to blue is not legible at a glance on a phone. */}
      <span
        className={`flex h-7 w-full max-w-[54px] items-center justify-center rounded-[10px] transition-colors ${
          active ? 'bg-primary/10 text-primary' : 'text-ink-faint group-active:bg-canvas'
        }`}
      >
        <Icon size={19} strokeWidth={active ? 2.4 : 1.9} />
      </span>
      <span
        className={`max-w-full truncate px-0.5 text-[10px] font-semibold leading-none ${
          active ? 'text-primary' : 'text-ink-faint'
        }`}
      >
        {label}
      </span>
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
  { label: 'Folders', short: 'Folders', icon: FolderOpen, path: '/folders' },
  { label: 'Subscription', short: 'Plans', icon: Award, path: '/payment' },
  { label: 'Integration', short: 'Connect', icon: Code2, path: '/integration' },
  { label: 'FAQ', short: 'Help', icon: HelpCircle, path: '/faq' },
]

/* ── Notifications ───────────────────────────────────────────────── */

const DAY_LABELS = { today: 'Today', yesterday: 'Yesterday', earlier: 'Earlier' }

function NotificationDropdown({ onClose }) {
  const { data: items = [] } = useNotifications()
  const markAllRead = useMarkAllNotificationsRead()
  const markOneRead = useMarkNotificationRead()
  const unread = items.filter((n) => !n.read).length
  const markAll = () => markAllRead.mutate()
  const markOne = (id) => markOneRead.mutate(id)
  const groups = ['today', 'yesterday', 'earlier']
    .map((day) => ({
      day: DAY_LABELS[day],
      items: items.filter((n) => dayBucket(n.updated_at) === day),
    }))
    .filter((g) => g.items.length)

  return (
    <div className="fixed left-3 right-3 top-[64px] sm:absolute sm:inset-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[380px] bg-surface rounded-[10px] shadow-pop border border-line overflow-hidden z-50 animate-pop">
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
              return (
                <button
                  key={n.id}
                  type="button"
                  onClick={() => markOne(n.id)}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-canvas/60 transition-colors border-b border-line/50 last:border-0 ${!n.read ? 'bg-primary/[0.02]' : ''}`}
                >
                  <div className="w-8 h-8 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 bg-primary/10 text-primary">
                    <QrCode size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between gap-2">
                      <p
                        className={`text-[13px] leading-snug ${!n.read ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}`}
                      >
                        {n.title}
                      </p>
                      <span className="text-[10px] text-ink-faint shrink-0 tabular-nums">
                        {timeAgo(n.updated_at)}
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
        {items.length === 0 && (
          <div className="py-10 flex flex-col items-center gap-2 text-center">
            <div className="w-10 h-10 rounded-[10px] bg-success/10 flex items-center justify-center">
              <Check size={18} className="text-success" />
            </div>
            <p className="text-sm font-medium text-ink-soft">
              You're all caught up!
            </p>
            <p className="px-6 text-center text-[11px] text-ink-faint">
              Scan alerts land here when someone scans a dynamic QR code.
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
  const { data: notifItems = [] } = useNotifications()
  const unreadCount = notifItems.filter((n) => !n.read).length
  const [theme, toggleTheme] = useTheme()

  // The Layout only mounts for signed-in pages, so this is the right place to
  // warm the sibling route chunks on idle — the first click of each nav icon is
  // then instant instead of flashing the blank Suspense fallback.
  useEffect(() => {
    prefetchSignedInRoutes()
  }, [])

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
        className="hidden md:flex w-[64px] shrink-0 sticky top-0 h-screen z-30 flex-col items-center pt-[10px] pb-5 gap-0"
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
          <LifftoMark size={26} className="text-white" />
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
              active={pathname === path || pathname.startsWith(`${path}/`)}
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
          className="h-[60px] bg-surface shrink-0 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6"
          style={{ borderBottom: '1px solid rgb(var(--c-line))' }}
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
            {/* Theme switch. The landing page has had one all along; signing in
                led to a set of pages with no way back out of whichever theme
                you were in. Same square as the bell so the two read as a pair. */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={
                theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'
              }
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className="w-9 h-9 rounded-[10px] border border-line text-ink-muted flex items-center justify-center transition-all hover:border-ink-muted/40 hover:bg-canvas hover:text-ink"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

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
                  <span className="w-[7px] h-[7px] bg-red-500 rounded-full absolute top-[7px] right-[7px] ring-[1.5px] ring-surface" />
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
        <div className="p-4 sm:p-6 pb-32 md:pb-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </main>

      {/* ── MOBILE BOTTOM NAV — destinations only ───────────────────
          The bar holds places, not verbs. Create used to sit in the middle of
          it, lifted half out: that cost a destination slot, overlapped the tabs
          either side, and put an action in a row of locations. It is a corner
          FAB now, below.

          Mapped once. It was built as "first two items, the button, the rest",
          which slices the same list twice — a destination added in the middle
          lands in neither slice and silently disappears with nothing failing. */}
      <nav
        aria-label="Main"
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-surface border-t border-line flex items-stretch px-1"
        style={{
          boxShadow: '0 -2px 14px rgb(var(--c-shadow) / 0.4)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
      >
        {NAV_ITEMS.map(({ short, icon, path }) => (
          <BottomTab
            key={path}
            icon={icon}
            label={short}
            active={pathname === path || pathname.startsWith(`${path}/`)}
            onClick={() => navigate(path)}
          />
        ))}
      </nav>

      {/* Create — a floating action, clear of the bar and the home indicator. */}
      <button
        type="button"
        onClick={handleCreate}
        aria-label="Create QR"
        title="Create QR"
        className="md:hidden fixed right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/40 transition-transform active:scale-95"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  )
}
