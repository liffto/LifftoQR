import { useState, useRef, useEffect } from 'react'
import toast from 'react-hot-toast'
import { useMutation } from '@tanstack/react-query'
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
  Loader2,
} from 'lucide-react'
import Layout from '../components/Layout'

const SUPPORT_EMAIL = 'support@liffto.com'
import { useAuth } from '../context/AuthContext'
import { uploadAvatar, updateProfile, mapApiUser } from '../api/auth.api'
import { updateNotificationPrefs } from '../api/notifications.api'
import { useQrs } from '../hooks/useQrs'
import {
  useDevices,
  useSignOutDevice,
  useSignOutOtherDevices,
} from '../hooks/useDevices'
import { clearDraft } from '../lib/store'
import { advanceOnEnter } from '../lib/enterToAdvance'
import { compressImageFile } from '../lib/imageCompress'
import { isValidPhone } from '../lib/countries'
import PhoneInput from '../components/PhoneInput'
import { getApiErrorMessage } from '../utils/errors'
import {
  getDisplayName,
  getInitials,
  resolvePictureUrl,
} from '../utils/userDisplay'

// GitHub-style destructive confirmation — requires typing the exact phrase.
const DEVICE_ICON = { desktop: Monitor, mobile: Smartphone, tablet: Tablet }

// Coarse on purpose: "3 days ago" is all this list needs, and it avoids
// pulling in a date library for one label.
function timeAgo(iso) {
  const then = new Date(iso).getTime()
  if (Number.isNaN(then)) return 'Unknown'
  const mins = Math.max(0, Math.round((Date.now() - then) / 60000))
  if (mins < 1) return 'Active now'
  if (mins < 60) return `${mins} min ago`
  const hours = Math.round(mins / 60)
  if (hours < 24) return `${hours} hr ago`
  const days = Math.round(hours / 24)
  return days === 1 ? 'Yesterday' : `${days} days ago`
}

function SectionCard({
  title,
  icon: Icon,
  iconCls = 'text-primary',
  children,
}) {
  return (
    <div className="bg-surface rounded-[10px] shadow-card overflow-hidden">
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

function Field({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  hint,
  readOnly = false,
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-ink-muted mb-1.5">
        {label}
      </label>
      <input
        type={type}
        value={value ?? ''}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        readOnly={readOnly}
        placeholder={placeholder}
        className={`w-full rounded-[10px] px-4 py-2.5 text-sm border border-line outline-none transition ${
          readOnly
            ? 'bg-canvas text-ink-muted cursor-not-allowed'
            : 'bg-canvas text-ink focus:border-primary focus:bg-surface focus:ring-2 focus:ring-primary/10'
        }`}
      />
      {hint && <p className="mt-1 text-[11px] text-ink-faint">{hint}</p>}
    </div>
  )
}

// Saved state is driven by the request actually succeeding, not a timer — the
// previous version flashed "Saved!" unconditionally while persisting nothing.
function SaveButton({
  label = 'Save Changes',
  onClick,
  saving = false,
  saved = false,
  disabled = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={saving || disabled}
      className={`h-10 px-5 rounded-[10px] text-sm font-semibold flex items-center gap-2 transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
        saved
          ? 'bg-success text-white'
          : 'bg-primary text-white hover:bg-primary-600 shadow-sm shadow-primary/25'
      }`}
    >
      {saving ? (
        <>
          <Loader2 size={15} className="animate-spin" /> Saving…
        </>
      ) : saved ? (
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
  const { user, logout, updateUser } = useAuth()
  const fileInputRef = useRef(null)
  const displayName = getDisplayName(user)
  const initials = getInitials(user)
  const email = user?.email ?? ''
  const serverPictureUrl = resolvePictureUrl(user?.picture, user?.pictureCacheKey)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [avatarImageError, setAvatarImageError] = useState(false)
  const displayAvatarUrl = avatarPreview || serverPictureUrl

  useEffect(() => {
    setAvatarImageError(false)
  }, [displayAvatarUrl])
  // Seeded from the saved user and written straight through on toggle — a
  // switch that needs a separate Save is a switch people think already saved.
  const [notifs, setNotifs] = useState({
    notify_scans: user?.notify_scans ?? true,
    notify_weekly: user?.notify_weekly ?? true,
    notify_product: user?.notify_product ?? false,
  })

  useEffect(() => {
    if (!user) return
    setNotifs({
      notify_scans: user.notify_scans ?? true,
      notify_weekly: user.notify_weekly ?? true,
      notify_product: user.notify_product ?? false,
    })
  }, [user])

  const prefsSave = useMutation({
    mutationFn: updateNotificationPrefs,
    onSuccess: (profile) => updateUser(mapApiUser(profile)),
    onError: (error, _vars, context) => {
      if (context?.previous) setNotifs(context.previous)
      toast.error(getApiErrorMessage(error, 'Could not save that preference'))
    },
    onMutate: (next) => {
      const previous = notifs
      setNotifs(next)
      return { previous }
    },
  })

  const toggleNotif = (key) =>
    prefsSave.mutate({ ...notifs, [key]: !notifs[key] })
  const {
    data: devices = [],
    isLoading: devicesLoading,
    isError: devicesError,
    refetch: refetchDevices,
  } = useDevices()
  const signOutDevice = useSignOutDevice()
  const signOutOthers = useSignOutOtherDevices()

  // Profile form. Seeded from the loaded user and re-seeded if that arrives
  // after first paint, but only while untouched so a refetch can't overwrite
  // what someone is in the middle of typing.
  //
  // Seeded from the raw stored fields, NOT getFirstName/getLastName: those
  // guess a surname by splitting the display name when last_name is empty, so
  // a user stored as ("KAVUTHAMRAJ GS", "") would render as First="KAVUTHAMRAJ
  // GS" / Last="GS" and saving would persist the guess back as "…GS GS".
  const [form, setForm] = useState({
    firstName: user?.first_name ?? '',
    lastName: user?.last_name ?? '',
    phone: user?.phone ?? '',
  })
  const [dirty, setDirty] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  useEffect(() => {
    if (dirty) return
    setForm({
      firstName: user?.first_name ?? '',
      lastName: user?.last_name ?? '',
      phone: user?.phone ?? '',
    })
  }, [user, dirty])

  const setField = (key) => (value) => {
    setDirty(true)
    setJustSaved(false)
    setForm((f) => ({ ...f, [key]: value }))
  }

  const profileSave = useMutation({
    mutationFn: () =>
      updateProfile({
        first_name: form.firstName.trim(),
        last_name: form.lastName.trim(),
        phone: form.phone.trim(),
      }),
    onSuccess: (profile) => {
      updateUser(mapApiUser(profile))
      setDirty(false)
      setJustSaved(true)
      toast.success('Profile updated')
    },
    onError: (error) =>
      toast.error(getApiErrorMessage(error, 'Could not save your profile')),
  })

  const phoneIncomplete = form.phone.trim() !== '' && !isValidPhone(form.phone)
  const canSave =
    dirty && form.firstName.trim() !== '' && !phoneIncomplete
  const avatarUpload = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: (profile) => {
      setAvatarPreview(null)
      updateUser({
        ...mapApiUser(profile),
        pictureCacheKey: Date.now(),
      })
      toast.success('Profile photo updated')
    },
    onError: (error) => {
      setAvatarPreview(null)
      toast.error(getApiErrorMessage(error, 'Failed to upload profile photo'))
    },
  })

  const handleAvatarPick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    if (file.type === 'image/svg+xml') {
      toast.error('SVG is not supported for profile photos. Use PNG or JPG.')
      return
    }
    if (!file.type.startsWith('image/')) {
      toast.error('Please choose an image file (JPG, PNG, WebP, or GIF)')
      return
    }

    try {
      const preview = await compressImageFile(file, {
        maxSize: 512,
        quality: 0.88,
      })
      setAvatarPreview(preview)
      setAvatarImageError(false)

      avatarUpload.mutate(preview)
    } catch (err) {
      setAvatarPreview(null)
      toast.error(err?.message || 'Could not process that image. Try another file.')
    }
  }

  const { data: qrs = [], isLoading: qrsLoading } = useQrs()
  const totalScans = qrs.reduce((s, r) => s + (r.scans || 0), 0)

  return (
    <Layout breadcrumb="Account">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5 max-w-5xl">
        {/* LEFT — Profile card */}
        <div className="space-y-4">
          <div className="bg-surface rounded-[10px] shadow-card overflow-hidden">
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
                {!avatarImageError && displayAvatarUrl ? (
                  <img
                    key={displayAvatarUrl}
                    src={displayAvatarUrl}
                    alt=""
                    className="w-[72px] h-[72px] rounded-full object-cover ring-4 ring-white shadow-lg"
                    onError={() => setAvatarImageError(true)}
                  />
                ) : (
                  <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-primary to-[#7c3aed] text-white flex items-center justify-center text-2xl font-bold select-none ring-4 ring-white shadow-lg">
                    {initials}
                  </div>
                )}
                {avatarUpload.isPending && (
                  <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center ring-4 ring-white">
                    <Loader2 size={20} className="text-white animate-spin" />
                  </div>
                )}
                <button
                  type="button"
                  onClick={handleAvatarPick}
                  disabled={avatarUpload.isPending}
                  className="absolute bottom-0.5 right-0.5 w-6 h-6 rounded-full bg-surface border border-line text-ink-soft flex items-center justify-center shadow-sm hover:border-primary hover:text-primary transition-colors disabled:opacity-60"
                  aria-label="Change avatar"
                >
                  <Camera size={11} />
                </button>
              </div>
              <p className="font-bold text-ink text-base">{displayName}</p>
              <p className="text-xs text-ink-muted mt-0.5">{email}</p>
              <span className="mt-2.5 text-[11px] bg-success/10 border border-success/20 text-success rounded-full px-3 py-1 font-semibold">
                All features unlocked
              </span>
              <div className="mt-4 w-full grid grid-cols-2 gap-2.5">
                <div className="bg-canvas rounded-[10px] p-3 text-center">
                  <p className="text-[11px] text-ink-muted mb-1">QR Codes</p>
                  <p className="text-xl font-bold text-ink">
                    {qrsLoading ? '—' : qrs.length.toLocaleString()}
                  </p>
                </div>
                <div className="bg-canvas rounded-[10px] p-3 text-center">
                  <p className="text-[11px] text-ink-muted mb-1">Total Scans</p>
                  <p className="text-xl font-bold text-ink">
                    {qrsLoading ? '—' : totalScans.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick links */}
          <div className="bg-surface rounded-[10px] shadow-card p-4 space-y-1">
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
            <button
              type="button"
              onClick={() => {
                clearDraft()
                logout()
              }}
              className="md:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-sm text-danger hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors"
            >
              <LogOut size={16} className="text-danger" />
              Log Out
            </button>
          </div>
        </div>

        {/* RIGHT — Settings sections */}
        <div className="flex flex-col gap-4">
          {/* Profile info */}
          <SectionCard title="Profile Information" icon={User}>
            <div
              onKeyDown={(e) =>
                advanceOnEnter(e, {
                  onLast: () => canSave && profileSave.mutate(),
                })
              }
              className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5"
            >
              <Field
                label="First Name"
                value={form.firstName}
                onChange={setField('firstName')}
              />
              <Field
                label="Last Name"
                value={form.lastName}
                onChange={setField('lastName')}
              />
              <Field
                label="Email Address"
                type="email"
                value={email}
                readOnly
                hint="Managed by your Google account"
              />
              <div>
                <label className="block text-xs font-medium text-ink-muted mb-1.5">
                  Phone
                </label>
                <PhoneInput
                  id="profile-phone"
                  value={form.phone}
                  onChange={setField('phone')}
                />
              </div>
            </div>
            <SaveButton
              label="Save Changes"
              onClick={() => profileSave.mutate()}
              saving={profileSave.isPending}
              saved={justSaved}
              disabled={!canSave}
            />
          </SectionCard>

          {/* Devices */}
          <SectionCard title="Manage Devices" icon={Monitor}>
            {devicesLoading ? (
              <div className="space-y-3">
                {[0, 1].map((i) => (
                  <div key={i} className="flex items-center gap-3 py-1">
                    <div className="h-9 w-9 shrink-0 rounded-[10px] shimmer" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3.5 w-32 rounded shimmer" />
                      <div className="h-3 w-48 rounded shimmer" />
                    </div>
                  </div>
                ))}
              </div>
            ) : devicesError ? (
              <p className="py-2 text-sm text-ink-muted">
                Couldn't load your devices.{' '}
                <button
                  type="button"
                  onClick={() => refetchDevices()}
                  className="font-semibold text-primary hover:underline"
                >
                  Try again
                </button>
              </p>
            ) : devices.length === 0 ? (
              <p className="py-2 text-sm text-ink-muted leading-relaxed">
                No signed-in devices to show yet. Sessions started before device
                tracking existed aren't listed — sign in again and this device
                will appear here.
              </p>
            ) : (
              <>
                <div className="-my-1 divide-y divide-line">
                  {devices.map((d) => {
                    const Icon = DEVICE_ICON[d.device_type] || Monitor
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
                              {d.device_name}
                              {d.current && (
                                <span className="text-[10px] font-semibold bg-success/10 text-success rounded-full px-2 py-0.5">
                                  This device
                                </span>
                              )}
                            </p>
                            <p className="text-xs text-ink-muted mt-0.5 truncate">
                              {[d.browser, d.ip_address].filter(Boolean).join(' · ')}
                              {d.browser || d.ip_address ? ' · ' : ''}
                              {d.current ? 'Active now' : timeAgo(d.last_seen_at)}
                            </p>
                          </div>
                        </div>
                        {!d.current && (
                          <button
                            type="button"
                            onClick={() => signOutDevice.mutate(d.id)}
                            disabled={signOutDevice.isPending}
                            className="shrink-0 flex items-center gap-1.5 h-8 px-3 rounded-[10px] border border-line text-ink-soft text-xs font-medium hover:border-danger hover:text-danger hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors disabled:opacity-50"
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
                    onClick={() => signOutOthers.mutate()}
                    disabled={signOutOthers.isPending}
                    className="mt-4 text-xs font-semibold text-danger hover:underline disabled:opacity-50"
                  >
                    Sign out all other devices
                  </button>
                )}
              </>
            )}
          </SectionCard>

          {/* Notification prefs */}
          <SectionCard title="Notification Preferences" icon={Bell}>
            <div className="space-y-4">
              {[
                {
                  key: 'notify_scans',
                  label: 'QR Scan Alerts',
                  desc: 'Get notified when your QR code is scanned',
                },
                {
                  key: 'notify_weekly',
                  label: 'Weekly Summary',
                  desc: 'Weekly report of your QR code performance',
                  soon: true,
                },
                {
                  key: 'notify_product',
                  label: 'Product Updates',
                  desc: 'New features and updates from Liffto',
                  soon: true,
                },
              ].map(({ key, label, desc, soon }) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-4"
                >
                  <div>
                    <p className="text-sm font-medium text-ink flex items-center gap-2">
                      {label}
                      {soon && (
                        <span className="text-[10px] font-semibold bg-canvas text-ink-muted rounded-full px-2 py-0.5">
                          Email coming soon
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-ink-muted mt-0.5 leading-relaxed">
                      {desc}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleNotif(key)}
                    className={`shrink-0 w-10 h-6 rounded-full transition-colors relative ${notifs[key] ? 'bg-primary' : 'bg-ink-faint/40'}`}
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

          {/* Deleting an account.
              
              This button used to open a type-the-words-to-confirm dialog
              promising to permanently delete the account and every code, and
              then called logout(). Nothing was deleted. Someone asking to be
              forgotten — quite possibly for exactly the reasons people ask that
              — was told it had happened and signed out, with all of it still
              there.
              
              There is no endpoint to call: the API can delete a single QR code
              and sign a device out, and has nothing for removing an account. So
              this now says what actually happens and hands the request to a
              person, which is what the privacy policy already told people to
              expect. */}
          <div className="bg-surface rounded-[10px] shadow-card overflow-hidden border border-red-100 dark:border-red-500/25">
            <div className="flex items-center gap-3 px-6 py-4 border-b border-red-100 bg-red-50/40 dark:border-red-500/25 dark:bg-red-500/10">
              <div className="w-8 h-8 rounded-[10px] bg-red-100 dark:bg-red-500/20 flex items-center justify-center">
                <Shield size={15} className="text-danger" />
              </div>
              <h3 className="font-semibold text-danger text-sm">Delete Account</h3>
            </div>
            <div className="p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-ink">
                  Deleting your account is handled by a person
                </p>
                <p className="text-xs text-ink-muted mt-0.5 leading-relaxed max-w-md">
                  Email us and we will remove your account and every code on it.
                  We cannot do it from this page yet, and would rather say so
                  than pretend otherwise.
                </p>
              </div>
              <a
                href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Delete my Liffto account')}`}
                className="shrink-0 h-9 px-4 rounded-[10px] border border-danger text-danger text-sm font-medium inline-flex items-center gap-2 hover:bg-red-50 dark:hover:bg-red-500/15 transition-colors"
              >
                <Trash2 size={14} /> Request deletion
              </a>
            </div>
          </div>
        </div>
      </div>

    </Layout>
  )
}
