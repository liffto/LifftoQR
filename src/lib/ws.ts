function isLocalHost(url: string): boolean {
  try {
    const { hostname } = new URL(url.includes('://') ? url : `https://${url}`)
    return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '::1'
  } catch {
    return false
  }
}

export function resolveWsBaseUrl(): string {
  const explicit = import.meta.env.VITE_WS_BASE_URL?.replace(/\/$/, '')
  if (explicit && !(import.meta.env.PROD && isLocalHost(explicit))) {
    return explicit
  }

  const backend = import.meta.env.VITE_BACKEND_API_URL?.replace(/\/$/, '')
  if (backend && !(import.meta.env.PROD && isLocalHost(backend))) {
    return backend.replace(/^http/i, 'ws')
  }

  // Production: API host (same project that serves /ws). Prefer the short-link
  // domain so one env var keeps scan links and live counts aligned.
  if (import.meta.env.PROD) {
    const host = (
      import.meta.env.VITE_SHORT_URL_DOMAIN ||
      'liffto-qr.vercel.app'
    )
      .replace(/^https?:\/\//i, '')
      .replace(/\/$/, '')
    return `wss://${host}`
  }

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}`
}

export function qrScanWebSocketUrl(slug: string): string {
  return `${resolveWsBaseUrl()}/ws/qr/${slug}`
}
