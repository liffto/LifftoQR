import { useState } from 'react'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { useGoogleLogin } from '../hooks/useGoogleLogin'
import GoogleSignInButton from './GoogleSignInButton'

// The sign-in form itself, with no opinion about how it is framed — the modal
// wraps it in a dialog. Keeping it separate means the Google button, its error
// handling and the terms copy have exactly one definition.
export default function LoginPanel({ compact = false }) {
  const googleLogin = useGoogleLogin()
  const [error, setError] = useState('')

  const handleGoogleSuccess = (idToken) => {
    setError('')
    googleLogin.mutate(idToken)
  }

  const handleGoogleError = (err) => {
    const message = err?.message || 'Google sign-in was cancelled.'
    if (/cancel/i.test(message) || /popup closed/i.test(message)) {
      setError('Google sign-in was cancelled.')
      return
    }
    setError(message)
  }

  return (
    <div>
      <h1
        className={`font-bold text-ink tracking-tight ${compact ? 'text-[20px]' : 'text-[26px]'}`}
      >
        {/* Not "Welcome back": there is no way to tell a returning user from
            someone arriving for the first time, and most people who reach this
            dialog got here by making their first code. */}
        Sign in to Liffto
      </h1>
      <p
        className={`mt-1.5 text-sm text-ink-muted ${compact ? 'mb-5' : 'mb-7'}`}
      >
        Sign in with Google to manage your QR codes. New here? The same button
        creates your account.
      </p>

      {error && (
        <div className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <GoogleSignInButton
        disabled={googleLogin.isPending}
        loading={googleLogin.isPending}
        onSuccess={handleGoogleSuccess}
        onError={handleGoogleError}
      />

      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-faint">
        <ShieldCheck size={13} className="shrink-0" />
        Secure sign-in — no passwords to remember
      </div>

      {/* Opened in a new tab on purpose: this panel is usually a dialog over a
          half-finished code, and navigating away would abandon it. */}
      <p className="mt-6 text-center text-[11px] text-ink-faint leading-relaxed">
        By continuing you agree to Liffto's{' '}
        <a
          href="/terms"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-ink-soft"
        >
          Terms of Service
        </a>{' '}
        &{' '}
        <a
          href="/privacy"
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-ink-soft"
        >
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
