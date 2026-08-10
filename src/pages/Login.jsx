import { useState } from 'react'
import { Check, ShieldCheck, AlertCircle } from 'lucide-react'
import { useGoogleLogin } from '../hooks/useGoogleLogin'
import GoogleSignInButton from '../components/GoogleSignInButton'
import Logo from '../components/Logo'

const FEATURES = [
  'Dynamic QR codes with real-time editing',
  'Scan analytics & location insights',
  'Custom branding, logos & frames',
  'Download in PNG, SVG, PDF & more',
]

export default function Login() {
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
    <div className="min-h-screen flex">
      {/* LEFT — Brand panel */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[40%] bg-gradient-to-br from-[#1B59F5] via-[#2050d8] to-[#7c3aed] flex-col justify-between p-10 relative overflow-hidden shrink-0">
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/[0.05]" />
        <div className="absolute bottom-10 -left-20 w-72 h-72 rounded-full bg-white/[0.04]" />
        <div className="absolute top-1/2 right-8 w-20 h-20 rounded-full bg-white/[0.07]" />

        <div className="relative z-10">
          <Logo white size="lg" />
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center py-10">
          <div className="inline-flex items-center gap-2 bg-white/15 border border-white/20 rounded-full px-3 py-1.5 text-xs text-white/90 font-medium mb-6 w-fit">
            <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
            All plans free during launch
          </div>
          <h2 className="text-3xl font-extrabold text-white leading-tight mb-4">
            QR codes that work
            <br />
            as hard as you do
          </h2>
          <p className="text-white/65 text-base leading-relaxed mb-8 max-w-xs">
            Create stunning, trackable QR codes in seconds. No design skills
            needed.
          </p>
          <div className="space-y-3.5">
            {FEATURES.map((f) => (
              <div key={f} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                  <Check size={11} className="text-white" />
                </div>
                <span className="text-white/85 text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 bg-white/10 border border-white/15 rounded-[10px] p-4">
          <p className="text-white/75 text-sm italic leading-relaxed">
            "We switched all our restaurant menus to Liffto QR codes. The
            analytics alone saved us thousands in printing costs."
          </p>
          <div className="flex items-center gap-2.5 mt-3">
            <div className="w-7 h-7 rounded-full bg-white/25 flex items-center justify-center text-white text-xs font-bold shrink-0">
              R
            </div>
            <div>
              <p className="text-white/90 text-xs font-semibold">Ramesh K.</p>
              <p className="text-white/50 text-[11px]">
                Restaurant Owner, Chennai
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT — Form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-canvas">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex justify-center mb-8">
            <Logo variant="create" size="lg" />
          </div>

          <h1 className="text-[26px] font-bold text-ink tracking-tight">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-ink-muted mb-7">
            Sign in with Google to manage your QR codes. New here? The same
            button creates your account.
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

          <p className="mt-6 text-center text-[11px] text-ink-faint leading-relaxed">
            By continuing you agree to Liffto's{' '}
            <a className="underline cursor-pointer">Terms of Service</a> &{' '}
            <a className="underline cursor-pointer">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </div>
  )
}
