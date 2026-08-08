import { useState, useRef } from 'react'
import toast from 'react-hot-toast'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Camera,
  User,
  Bell,
  Trash2,
  Shield,
  QrCode,
  BarChart2,
  Check,
  Monitor,
  Smartphone,
  Tablet,
  LogOut,
  X,
} from 'lucide-react'
import Layout from '../components/Layout'
import { useAuth } from '../context/AuthContext'
import { uploadAvatar, mapApiUser } from '../api/auth.api'
import { CURRENT_USER_QUERY_KEY } from '../providers/QueryProvider'
import { getAccessToken, getRefreshToken, saveUser } from '../services/session'
import { getApiErrorMessage } from '../utils/errors'
import { getQRs } from '../lib/store'
import {
  getDisplayName,
  getFirstName,
  getInitials,
  getLastName,
  resolvePictureUrl,
} from '../utils/userDisplay'

const DELETE_CONFIRM_PHRASE = 'Delete Account'

// GitHub-style destructive confirmation — requires typing the exact phrase.
function DeleteAccountModal({ onConfirm, onCancel }) {
  const [text, setText] = useState('')
  const matches = text === DELETE_CONFIRM_PHRASE

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade">
      <div className="bg-white rounded-[10px] shadow-2xl w-full max-w-sm animate-pop">
        <div className="flex items-center justify-between px-6 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <Shield size={18} className="text-danger" />
            <h2 className="font-semibold text-ink">Delete Account</h2>
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="w-8 h-8 rounded-[10px] flex items-center justify-center text-ink-soft hover:bg-canvas"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <p className="text-sm text-ink-soft leading-relaxed">
            This will permanently delete your account and all of your QR codes.{' '}
            <span className="font-semibold text-danger">
              This action cannot be undone.
            </span>
          </p>
          <div>
            <label className="block text-xs text-ink-muted mb-1.5">
              Type{' '}
              <span className="font-semibold text-ink">
                {DELETE_CONFIRM_PHRASE}
              </span>{' '}
              to confirm
            </label>
            <input
              autoFocus
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && matches && onConfirm()}
              placeholder={DELETE_CONFIRM_PHRASE}
              className="w-full h-11 rounded-[10px] border border-line px-4 text-sm text-ink focus:border-danger focus:ring-2 focus:ring-danger/10 outline-none transition"
            />
          </div>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 h-10 rounded-[10px] border border-line text-ink-soft text-sm font-medium hover:bg-canvas transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!matches}
            onClick={onConfirm}
            className="flex-1 h-10 rounded-[10px] bg-danger text-white text-sm font-medium hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  )
}

const DEVICE_ICON = { desktop: Monitor, mobile: Smartphone, tablet: Tablet }

const INITIAL_DEVICES = [
  {
    id: 1,
    type: 'desktop',
    name: 'MacBook Pro',
    meta: 'Chrome · Chennai, India',
    lastActive: 'Active now',
    current: true,
  },
  {
    id: 2,
    type: 'mobile',
    name: 'iPhone 15',
    meta: 'Safari · Chennai, India',
    lastActive: '2 hours ago',
  },
  {
    id: 3,
    type: 'tablet',
    name: 'iPad Air',
    meta: 'Safari · Bengaluru, India',
    lastActive: '3 days ago',
  },
  {
    id: 4,
    type: 'desktop',
    name: 'Windows PC',
    meta: 'Edge · Coimbatore, India',
    lastActive: '1 week ago',
  },
]

function SectionCard({
  title,
  icon: Icon,
  iconCls = 'text-primary',
  children,
}) {
  return (
    <div className="bg-white rounded-[10px] shadow-card overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-line">
        <div
          className={`w-8 h-8 rounded-[10px] bg-primary/10 flex items-center justify-center ${iconCls}`}
        >
          <Icon size={16} />
        </div>
        <h3 className="font-semibold text-ink text-sm">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

function Field({ label, type = 'text', defaultValue, placeholder, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-muted mb-1.5">
        {label}
      </label>
      <input
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full bg-canvas rounded-[10px] px-4 py-2.5 text-sm text-ink border border-line focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 outline-none transition"
      />
      {hint && <p className="mt-1 text-[11px] text-ink-faint">{hint}</p>}
    </div>
  )
}

function SaveButton({ label = 'Save Changes', onClick }) {
  const [saved, setSaved] = useState(false)
  const handle = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
    onClick?.()
  }
  return (
    <button
      type="button"
      onClick={handle}
      className={`h-10 px-5 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-all ${
        saved
          ? 'bg-success text-white'
          : 'bg-primary text-white hover:bg-primary-600 shadow-sm shadow-primary/25'
      }`}
    >
      {saved ? (
        <>
          <Check size={15} /> Saved!
        </>
      ) : (
        label
      )}
    </button>
  )
}

export default function UserAccount() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const fileInputRef = useRef(null)
  const displayName = getDisplayName(user)
  const initials = getInitials(user)
  const firstName = getFirstName(user)
  const lastName = getLastName(user)
  const email = user?.email ?? ''
  const pictureUrl = resolvePictureUrl(user?.picture)
  const [notifs, setNotifs] = useState({
    scans: true,
    weekly: true,
    product: false,
  })
  const [devices, setDevices] = useState(INITIAL_DEVICES)
  const removeDevice = (id) => setDevices((ds) => ds.filter((d) => d.id !== id))
  const signOutOthers = () => setDevices((ds) => ds.filter((d) => d.current))
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const avatarUpload = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (profile) => {
      const updatedUser = mapApiUser(profile)
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updatedUser)
      saveUser(updatedUser, getAccessToken(), getRefreshToken())
      toast.success('Profile photo updated')
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error, 'Failed to upload profile photo'))
    },
  })

  const handleAvatarPick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, WebP, or GIF)')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be smaller than 2 MB')
      return
    }

    avatarUpload.mutate(file)
  }

  const handleConfirmDelete = () => {
    logout()
  }
  const qrs = getQRs()
  const totalScans = qrs.reduce((s, r) => s + (r.scans || 0), 0)

  return (
    <Layout breadcrumb="Account">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 max-w-5xl">
        {/* LEFT — Profile card */}
        <div className="space-y-4">
          <div className="bg-white rounded-[10px] shadow-card overflow-hidden">
            {/* Gradient header */}
            <div className="h-20 bg-gradient-to-br from-primary via-[#2563eb] to-[#7c3aed] relative">
              <div
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 70% 50%, white 0%, transparent 60%)',
                }}
              />
            </div>
            <div className="px-5 pb-5 flex flex-col items-center text-center -mt-9">
              <div className="relative mb-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                {pictureUrl ? (
                  <img
                    src={pictureUrl}
                    alt={displayName}
                    className="w-[72px] h-[72px] rounded-full object-cover ring-4 ring-white shadow-lg"
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-[#7c3aed] text-white flex items-center justify-center text-2xl font-bold select-none ring-4 ring-white shadow-lg">
                    {initials}
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={avatarUpload.isPending}
                  className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-white border border-line text-ink-soft flex items-center justify-center shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
                  aria-label="Change avatar"
                >
                  <Camera size={11} />
                </button>
              </div>
              <p className="font-bold text-ink text-base">{displayName}</p>
              <p className="text-xs text-ink-muted mt-0.5">{email}</p>
              <span className="mt-2.5 text-[11px] bg-amber-50 border border-amber-200 text-amber-600 rounded-full px-3 py-1 font-semibold">
                Free Plan
              </span>
              <div className="mt-4 w-full grid grid-cols-2 gap-2.5">
                <div className="bg-canvas rounded-[10px] p-3 text-center">
                  <p className="text-[11px] text-ink-muted mb-1">QR Codes</p>
                  <p className="text-xl font-bold text-ink">{qrs.length}</p>
                </div>
                <div className="bg-canvas rounded-[10px] p-3 text-center">
                  <p className="text-[11px] text-ink-muted mb-1">Total Scans</p>
                  <p className="text-xl font-bold text-ink">
                    {totalScans.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-white rounded-[10px] shadow-card p-4 space-y-1">
            {[
              { icon: QrCode, label: 'My QR Codes', href: '/dashboard' },
              { icon: BarChart2, label: 'Subscription', href: '/payment' },
            ].map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm text-ink-soft hover:bg-canvas hover:text-ink transition-colors"
              >
                <Icon size={16} className="text-ink-faint" />
                {label}
              </a>
            ))}
          </div>
        </div>

        {/* RIGHT — Settings sections */}
        <div className="flex flex-col gap-4">
          {/* Profile info */}
          <SectionCard title="Profile Information" icon={User}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <Field label="First Name" defaultValue={firstName} />
              <Field label="Last Name" defaultValue={lastName} />
              <Field label="Email Address" type="email" defaultValue={email} />
              <Field label="Phone" type="tel" placeholder="+1 (000) 000-0000" />
            </div>
            <SaveButton label="Save Changes" />
          </SectionCard>

          {/* Devices */}
          <SectionCard title="Manage Devices" icon={Monitor}>
            <div className="-my-1 divide-y divide-line">
              {devices.map((d) => {
                const Icon = DEVICE_ICON[d.type] || Monitor
                return (
                  <div
                    key={d.id}
                    className="flex items-center justify-between gap-4 py-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-[10px] bg-canvas flex items-center justify-center shrink-0 text-ink-soft">
                        <Icon size={17} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-ink flex items-center gap-2">
                          {d.name}
                          {d.current && (
                            <span className="text-[10px] font-semibold bg-success/10 text-success rounded-full px-2 py-0.5">
                              This device
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-ink-muted mt-0.5 truncate">
                          {d.meta} · {d.lastActive}
                        </p>
                      </div>
                    </div>
                    {!d.current && (
                      <button
                        type="button"
                        onClick={() => removeDevice(d.id)}
                        className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-line text-ink-soft text-xs font-medium hover:border-danger hover:text-danger hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={13} /> Remove
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
            {devices.some((d) => !d.current) && (
              <button
                type="button"
                onClick={signOutOthers}
                className="mt-4 text-xs font-semibold text-danger hover:underline"
              >
                Sign out all other devices
              </button>
            )}
          </SectionCard>

          {/* Notification prefs */}
          <SectionCard title="Notification Preferences" icon={Bell}>
            <div className="space-y-4">
              {[
                {
                  key: 'scans',
                  label: 'QR Scan Alerts',
                  desc: 'Get notified when your QR code is scanned',
                },
                {
                  key: 'weekly',
                  label: 'Weekly Summary',
                  desc: 'Weekly report of your QR code performance',
                },
                {
                  key: 'product',
                  label: 'Product Updates',
                  desc: 'New features and updates from AffinityX',
                },
              ].map(({ key, label, desc }) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-ink">{label}</p>
                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifs((n) => ({ ...n, [key]: !n[key] }))}
                    className={`shrink-0 w-10 h-6 rounded-full transition-colors relative ${notifs[key] ? 'bg-primary' : 'bg-gray-200'}`}
                    aria-pressed={notifs[key]}
                  >
                    <span
                      className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all ${notifs[key] ? 'left-5' : 'left-1'}`}
                    />
                  </button>
                </div>
              ))}
            </div>
          </SectionCard>

          {/* Danger zone */}
          <div className="bg-white rounded-[10px] shadow-card overflow-hidden border border-red-100">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-red-50/40">
              <div className="w-8 h-8 rounded-[10px] bg-red-100 flex items-center justify-center">
                <Shield size={15} className="text-danger" />
              </div>
              <h3 className="font-semibold text-danger text-sm">Danger Zone</h3>
            </div>
            <div className="p-6 flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-ink">Delete Account</p>
                <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                  Permanently delete your account and all QR codes. This action
                  cannot be undone.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="shrink-0 h-9 px-4 rounded-[10px] border border-danger text-danger text-sm font-medium flex items-center gap-2 hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteAccountModal
          onConfirm={handleConfirmDelete}
          onCancel={() => setShowDeleteModal(false)}
        />
      )}
    </Layout>
  )
}
