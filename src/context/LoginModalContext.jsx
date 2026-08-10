import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { X } from 'lucide-react'
import { useAuth } from './AuthContext'
import { setPendingRedirect } from '../lib/store'
import LoginPanel from '../components/LoginPanel'
import Logo from '../components/Logo'

const LoginModalContext = createContext(null)

export function useLoginModal() {
  const ctx = useContext(LoginModalContext)
  if (!ctx) {
    throw new Error('useLoginModal must be used inside a LoginModalProvider')
  }
  return ctx
}

function LoginModal({ open, onClose }) {
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
      <div className="w-full max-w-[420px] animate-pop overflow-hidden rounded-t-[16px] bg-white shadow-2xl sm:rounded-[16px]">
        <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
          <Logo variant="create" />
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
          <LoginPanel compact />
        </div>
      </div>
    </div>
  )
}

export function LoginModalProvider({ children }) {
  const [open, setOpen] = useState(false)
  const { isAuthenticated } = useAuth()

  const openLogin = useCallback((redirectTo) => {
    // Stashed rather than held in state so it survives the Google popup round
    // trip — useGoogleLogin reads it back after the token exchange.
    if (redirectTo) setPendingRedirect(redirectTo)
    setOpen(true)
  }, [])

  const closeLogin = useCallback(() => setOpen(false), [])

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
      <LoginModal open={open} onClose={closeLogin} />
    </LoginModalContext.Provider>
  )
}
