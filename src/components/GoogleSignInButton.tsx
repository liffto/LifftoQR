import { useCallback, useRef } from 'react'
import { GoogleLogin, useGoogleOAuth } from '@react-oauth/google'
import { FcGoogle } from 'react-icons/fc'
import { Loader2 } from 'lucide-react'

interface GoogleSignInButtonProps {
  disabled?: boolean
  loading?: boolean
  onSuccess: (idToken: string) => void
  onError?: (error: Error) => void
}

export default function GoogleSignInButton({
  disabled = false,
  loading = false,
  onSuccess,
  onError,
}: GoogleSignInButtonProps) {
  const hiddenHostRef = useRef<HTMLDivElement>(null)
  const { scriptLoadedSuccessfully } = useGoogleOAuth()

  const handleSuccess = (credentialResponse: { credential?: string }) => {
    if (!credentialResponse?.credential) {
      onError?.(new Error('Google did not return a sign-in token.'))
      return
    }
    onSuccess(credentialResponse.credential)
  }

  const handleError = () => {
    onError?.(new Error('Google sign-in was cancelled or failed.'))
  }

  const handleClick = useCallback(() => {
    if (disabled || loading || !scriptLoadedSuccessfully) return

    const googleButton = hiddenHostRef.current?.querySelector(
      '[role="button"]',
    ) as HTMLElement | null

    if (!googleButton) {
      onError?.(
        new Error('Google sign-in is still loading. Please wait a moment and try again.'),
      )
      return
    }

    googleButton.click()
  }, [disabled, loading, scriptLoadedSuccessfully, onError])

  const isDisabled = disabled || loading || !scriptLoadedSuccessfully

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={isDisabled}
        className="w-full h-[52px] rounded-[10px] border border-line bg-white hover:bg-canvas/80 hover:border-primary/30 flex items-center justify-center gap-3 font-semibold text-ink transition-colors shadow-sm disabled:opacity-70"
      >
        {loading ? (
          <>
            <Loader2 size={19} className="animate-spin" />
            Signing in…
          </>
        ) : (
          <>
            <FcGoogle size={23} />
            Continue with Google
          </>
        )}
      </button>

      {/* Hidden Google button — keeps layout clean, triggered by our styled button */}
      <div
        ref={hiddenHostRef}
        className="google-signin-hidden-host"
        aria-hidden="true"
      >
        <GoogleLogin
          onSuccess={handleSuccess}
          onError={handleError}
          useOneTap={false}
          theme="outline"
          size="large"
          text="continue_with"
          shape="rectangular"
          width="400"
        />
      </div>
    </>
  )
}
