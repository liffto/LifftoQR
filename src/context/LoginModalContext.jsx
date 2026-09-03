import {
  createContext,
  lazy,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { X } from 'lucide-react'
import { useAuth } from './AuthContext'
import {
  getDraft,
  setDraft,
  setPendingRedirect,
  takePendingRedirect,
} from '../lib/store'
import { findType } from '../lib/qrTypes'
import Logo from '../components/Logo'

// Fetched on demand rather than bundled with the app. The panel drags in
// Google's OAuth library, which in turn loads gsi/client from
// accounts.google.com the moment it mounts — all of it useless to a visitor
// who never signs in, which on a landing page is most of them. Warmed during
// idle time once the page has settled (see below), so the dialog still opens
// without a wait for the visitors who do.
const loadLoginPanel = () => import('../components/LoginPanel')
const LoginPanel = lazy(loadLoginPanel)

const LoginModalContext = createContext(null)

export function useLoginModal() {
  const ctx = useContext(LoginModalContext)
  if (!ctx) {
    throw new Error('useLoginModal must be used inside a LoginModalProvider')
  }
  return ctx
}

function LoginModal({ open, onClose, onContinueAsGuest }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center bg-black/40 backdrop-blur-sm animate-fade sm:items-center sm:p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Sign in"
    >
      <div className="w-full max-w-[420px] animate-pop overflow-hidden rounded-t-[16px] bg-surface shadow-2xl sm:rounded-[16px]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <Logo />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-[10px] text-ink-faint transition-colors hover:bg-canvas hover:text-ink"
          >
            <X size={17} />
          </button>
        </div>
        <div className="px-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-5">
          {/* Reserves roughly the panel's height so the dialog does not resize
              under the cursor on the rare occasion the warm-up has not
              finished. */}
          <Suspense fallback={<div className="h-[300px]" aria-busy="true" />}>
            <LoginPanel compact onContinueAsGuest={onContinueAsGuest} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export function LoginModalProvider({ children }) {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()
  const navigate = useNavigate()

  // The dialog is only ever in the way of one thing: a code that wanted to be
  // dynamic. Downgrading it to static finishes the job without an account,
  // because a static code is built and downloaded in the browser.
  //
  // Not offered for the four types that cannot be static — a contact card,
  // coupon, app link or link tree is a page we host, so there is nothing to
  // hand over without a record to host it against. Offering it there would be
  // a button that cannot do what it says.
  const draft = open ? getDraft() : null
  const guestPath =
    draft && !findType(draft.typeKey).requiresDynamic ? draft : null

  const continueAsGuest = useCallback(() => {
    const current = getDraft()
    if (!current) return
    setDraft({ ...current, dynamic: false, qrType: 'Static QR' })
    setOpen(false)
    navigate(takePendingRedirect() || '/create/design')
  }, [navigate])

  const openLogin = useCallback((redirectTo) => {
    // Stashed rather than held in state so it survives the Google popup round
    // trip — useGoogleLogin reads it back after the token exchange.
    if (redirectTo) setPendingRedirect(redirectTo)
    setOpen(true)
  }, [])

  const closeLogin = useCallback(() => setOpen(false), [])

  // Warm the panel once the browser has nothing better to do, so the dialog
  // opens instantly despite being a separate chunk. Idle time only — this must
  // never compete with the first paint it was split out to protect.
  useEffect(() => {
    const schedule = window.requestIdleCallback || ((fn) => setTimeout(fn, 2000))
    const cancel = window.cancelIdleCallback || clearTimeout
    const id = schedule(() => {
      loadLoginPanel()
    })
    return () => cancel(id)
  }, [])

  // Signing in succeeds asynchronously; dismiss on the auth state itself so the
  // modal cannot linger over an already-authenticated page.
  useEffect(() => {
    if (isAuthenticated) setOpen(false)
  }, [isAuthenticated])

  const value = useMemo(
    () => ({ isLoginOpen: open, openLogin, closeLogin }),
    [open, openLogin, closeLogin],
  )

  return (
    <LoginModalContext.Provider value={value}>
      {children}
      <LoginModal
        open={open}
        onClose={closeLogin}
        onContinueAsGuest={guestPath ? continueAsGuest : undefined}
      />
    </LoginModalContext.Provider>
  )
}
