export function resolveWsBaseUrl(): string {
  const explicit = import.meta.env.VITE_WS_BASE_URL?.replace(/\/$/, '')
  if (explicit) return explicit

  const backend = import.meta.env.VITE_BACKEND_API_URL?.replace(/\/$/, '')
  if (backend) return backend.replace(/^http/i, 'ws')

  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${proto}//${window.location.host}`
}

export function qrScanWebSocketUrl(slug: string): string {
  return `${resolveWsBaseUrl()}/ws/qr/${slug}`
}
