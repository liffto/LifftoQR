import { useState } from 'react'
import { ShieldCheck, AlertCircle } from 'lucide-react'
import { GoogleOAuthProvider } from '@react-oauth/google'
import { useGoogleLogin } from '../hooks/useGoogleLogin'
import GoogleSignInButton from './GoogleSignInButton'

// Read once when this chunk loads, and warned about once — inside the
// component this fired on every render, which on a page that re-renders as you
// type buried the console.
const googleClientId = import.meta.env.VITE_CLIENT_ID

if (!googleClientId) {
  console.warn('VITE_CLIENT_ID is missing — Google sign-in will not work.')
}

// The sign-in form itself, with no opinion about how it is framed — the modal
// wraps it in a dialog. Keeping it separate means the Google button, its error
// handling and the terms copy have exactly one definition.
// onContinueAsGuest, when given, offers a way past this dialog for a code that
// does not need an account. Absent means there is no honest guest path for
// whatever is pending, so no button is shown.
export default function LoginPanel({ compact = false, onContinueAsGuest }) {
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
        <div className="mb-5 flex items-start gap-2.5 rounded-[10px] border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Without a client id the button still renders and still opens Google,
          which then refuses the request and shows its own "Access blocked:
          Authorization Error — Missing required parameter: client_id". That
          reads like the account is in trouble rather than the build being
          misconfigured, so say what it actually is and do not send anyone to
          Google to find out. Only reachable in a build where the variable is
          absent; where it is set, this branch is constant-folded away and never
          ships.

          The provider is scoped to the button rather than the whole app: it
          pulls in Google's gsi/client script on mount, and nobody looking at
          the landing page needs that. */}
      {googleClientId ? (
        <GoogleOAuthProvider clientId={googleClientId}>
          <GoogleSignInButton
            disabled={googleLogin.isPending}
            loading={googleLogin.isPending}
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
          />
        </GoogleOAuthProvider>
      ) : (
        <div className="flex items-start gap-2.5 rounded-[10px] border border-amber-200 bg-amber-50 px-3.5 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>
            Sign-in isn&apos;t configured in this build — VITE_CLIENT_ID is
            missing. This is a build setting, not a problem with your account.
          </span>
        </div>
      )}

      <div className="mt-5 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
        <ShieldCheck size={13} className="shrink-0" />
        Secure sign-in — no passwords to remember
      </div>

      {/* Only rendered when the pending code can actually be finished without
          an account — the host decides, since the four types that need a page
          we host cannot. States the cost plainly instead of burying it: a
          static code is fixed the moment it is generated. */}
      {onContinueAsGuest && (
        <>
          <div className="my-5 flex items-center gap-3" aria-hidden="true">
            <span className="h-px flex-1 bg-line" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              or
            </span>
            <span className="h-px flex-1 bg-line" />
          </div>

          <button
            type="button"
            onClick={onContinueAsGuest}
            className="flex h-12 w-full items-center justify-center rounded-[10px] border border-line bg-surface text-sm font-semibold text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
          >
            Continue without an account
          </button>

          {/* The consequence in the warning colour, on its own line, because
              the muted paragraph underneath was being read past. red-700
              rather than the danger token: the token measures 3.73:1 on white
              and this has to be the most readable line here, not the least. */}
          <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[12.5px] font-semibold text-red-700">
            <AlertCircle size={14} className="shrink-0" />
            You will only get a Static QR code
          </p>

          <p className="mt-1.5 text-center text-[11.5px] leading-relaxed text-ink-muted">
            It is fixed the moment it is generated — the destination can&apos;t
            be changed and scans aren&apos;t counted. Sign in if you want to
            edit it later.
          </p>
        </>
      )}

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
