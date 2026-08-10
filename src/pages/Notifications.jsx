import { useState } from 'react'
import {
  Bell,
  QrCode,
  CreditCard,
  Info,
  CheckCheck,
  TrendingUp,
  Check,
} from 'lucide-react'
import Layout from '../components/Layout'

const INITIAL = [
  {
    id: 1,
    type: 'scan',
    icon: QrCode,
    bg: 'bg-primary/10',
    fg: 'text-primary',
    title: 'QR Code Scanned',
    body: 'Your QR code "www.cyberdine.in" was scanned 12 times today.',
    time: '2 min ago',
    day: 'today',
    read: false,
  },
  {
    id: 2,
    type: 'scan',
    icon: QrCode,
    bg: 'bg-primary/10',
    fg: 'text-primary',
    title: 'First Scan!',
    body: '"liffto-qr.vercel.app/m7c0YZ" received its very first scan — congratulations!',
    time: '1 hr ago',
    day: 'today',
    read: false,
  },
  {
    id: 3,
    type: 'billing',
    icon: CreditCard,
    bg: 'bg-amber-50',
    fg: 'text-amber-500',
    title: 'Everything is unlocked',
    body: 'Unlimited codes, analytics and every download format — all free.',
    time: '3 hr ago',
    day: 'today',
    read: false,
  },
  {
    id: 4,
    type: 'info',
    icon: Info,
    bg: 'bg-violet-50',
    fg: 'text-violet-500',
    title: 'New Feature: Frames',
    body: 'You can now add custom frames and call-to-action labels to your QR codes.',
    time: 'Yesterday',
    day: 'yesterday',
    read: true,
  },
  {
    id: 5,
    type: 'trend',
    icon: TrendingUp,
    bg: 'bg-success/10',
    fg: 'text-success',
    title: 'Weekly Summary',
    body: 'Your QR codes received 340 scans this week — up 18% from last week.',
    time: '2 days ago',
    day: 'earlier',
    read: true,
  },
  {
    id: 6,
    type: 'info',
    icon: Info,
    bg: 'bg-violet-50',
    fg: 'text-violet-500',
    title: 'Welcome to Liffto!',
    body: 'Get started by creating your first QR code. It only takes 30 seconds.',
    time: '3 days ago',
    day: 'earlier',
    read: true,
  },
]

const GROUP_LABELS = {
  today: 'Today',
  yesterday: 'Yesterday',
  earlier: 'Earlier',
}

function NotifItem({ n, onRead }) {
  const Icon = n.icon
  return (
    <button
      type="button"
      onClick={() => onRead(n.id)}
      className={`w-full flex items-start gap-4 px-6 py-4 text-left transition-colors hover:bg-canvas/70 ${!n.read ? 'bg-primary/[0.02]' : ''}`}
    >
      <div
        className={`w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0 mt-0.5 ${n.bg} ${n.fg}`}
      >
        <Icon size={17} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline justify-between gap-3">
          <p
            className={`text-sm leading-snug ${!n.read ? 'font-semibold text-ink' : 'font-medium text-ink-soft'}`}
          >
            {n.title}
          </p>
          <span className="text-[11px] text-ink-faint shrink-0 tabular-nums">
            {n.time}
          </span>
        </div>
        <p className="text-xs text-ink-muted mt-0.5 leading-relaxed pr-4">
          {n.body}
        </p>
      </div>
      {!n.read ? (
        <div className="w-2 h-2 rounded-full bg-primary mt-2 shrink-0" />
      ) : (
        <div className="w-2 h-2 shrink-0" />
      )}
    </button>
  )
}

export default function Notifications() {
  const [items, setItems] = useState(INITIAL)
  const unreadCount = items.filter((n) => !n.read).length

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })))
  const markRead = (id) =>
    setItems((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    )

  const groups = ['today', 'yesterday', 'earlier']
    .map((day) => ({
      day,
      label: GROUP_LABELS[day],
      items: items.filter((n) => n.day === day),
    }))
    .filter((g) => g.items.length > 0)

  return (
    <Layout breadcrumb="Notifications" notifDot={unreadCount > 0}>
      <div className="max-w-2xl">
        <div className="bg-white rounded-[10px] shadow-card overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-line">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center">
                <Bell size={16} className="text-primary" />
              </div>
              <h3 className="font-semibold text-ink">Notifications</h3>
              {unreadCount > 0 && (
                <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-none min-w-[20px] text-center">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 ? (
              <button
                type="button"
                onClick={markAllRead}
                className="flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
              >
                <CheckCheck size={14} /> Mark all read
              </button>
            ) : (
              <span className="flex items-center gap-1.5 text-xs text-success font-medium">
                <Check size={14} /> All caught up
              </span>
            )}
          </div>

          {/* Grouped list */}
          {groups.length > 0 ? (
            <div>
              {groups.map(({ day, label, items: groupItems }) => (
                <div key={day}>
                  <div className="px-6 py-2 bg-canvas/60 border-b border-line">
                    <p className="text-[10px] font-bold text-ink-muted uppercase tracking-widest">
                      {label}
                    </p>
                  </div>
                  <div className="divide-y divide-line/60">
                    {groupItems.map((n) => (
                      <NotifItem key={n.id} n={n} onRead={markRead} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 flex flex-col items-center gap-3 text-center">
              <div className="w-12 h-12 rounded-[10px] bg-success/10 flex items-center justify-center">
                <CheckCheck size={22} className="text-success" />
              </div>
              <p className="font-semibold text-ink">You're all caught up!</p>
              <p className="text-sm text-ink-muted">
                No new notifications right now.
              </p>
            </div>
          )}
        </div>
      </div>
    </Layout>
  )
}
