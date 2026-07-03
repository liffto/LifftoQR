// AFFINITYX brand mark + wordmark.
// variant: 'create' | 'platform'
// white: true = white text (for dark backgrounds)
export default function Logo({
  variant = 'create',
  size = 'md',
  white = false,
}) {
  const dim = size === 'lg' ? 40 : 34
  const fillColor = white ? '#ffffff' : '#1B59F5'
  const nameColor = white ? 'text-white' : 'text-ink'
  const subColor = white ? 'text-white/80' : 'text-primary'
  const subMuted = white ? 'text-white/60' : 'text-ink-muted'
  return (
    <div className="flex items-center gap-2.5">
      <svg width={dim} height={dim} viewBox="0 0 32 32" aria-hidden>
        <rect x="2" y="2" width="12" height="12" rx="3.5" fill={fillColor} />
        <rect x="18" y="2" width="12" height="12" rx="3.5" fill={fillColor} />
        <rect x="2" y="18" width="12" height="12" rx="3.5" fill={fillColor} />
        <rect x="19" y="19" width="3.6" height="3.6" fill={fillColor} />
        <rect x="25" y="19" width="3.6" height="3.6" fill={fillColor} />
        <rect x="19" y="25" width="3.6" height="3.6" fill={fillColor} />
        <rect x="25" y="25" width="3.6" height="3.6" fill={fillColor} />
      </svg>
      <div className="leading-none">
        <div className={`text-sm font-semibold tracking-wide ${nameColor}`}>
          AFFINITYX
        </div>
        {variant === 'create' ? (
          <div className={`text-base font-bold leading-tight ${subColor}`}>
            Create QR
          </div>
        ) : (
          <div className={`text-[11px] font-medium leading-tight ${subMuted}`}>
            QR Platform
          </div>
        )}
      </div>
    </div>
  )
}
