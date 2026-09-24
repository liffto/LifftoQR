import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { QrListItem } from '../api/qrcode/qr'
import { qrScanWebSocketUrl } from '../lib/ws'
import { qrsQueryKey } from './useQrs'

export type QrScanConnectionStatus =
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'error'

type ScanCountMessage = {
  event: 'scan_count' | 'scan_count_updated'
  slug: string
  scan_count: number
}

function isScanCountMessage(data: unknown): data is ScanCountMessage {
  if (!data || typeof data !== 'object') return false
  const message = data as ScanCountMessage
  return (
    (message.event === 'scan_count' ||
      message.event === 'scan_count_updated') &&
    typeof message.slug === 'string' &&
    typeof message.scan_count === 'number'
  )
}

function patchScanCountInCache(
  queryClient: ReturnType<typeof useQueryClient>,
  slug: string,
  scanCount: number,
) {
  queryClient.setQueryData<QrListItem[]>(qrsQueryKey, (old) =>
    old?.map((item) =>
      item.slug === slug ? { ...item, scans: scanCount } : item,
    ),
  )

  const queries = queryClient.getQueriesData<QrListItem>({
    queryKey: ['qr'],
  })
  for (const [key, item] of queries) {
    if (item?.slug === slug) {
      queryClient.setQueryData(key, { ...item, scans: scanCount })
    }
  }
}

export function useQrScanCount(slug: string | null | undefined) {
  const queryClient = useQueryClient()
  const [scanCount, setScanCount] = useState<number | null>(null)
  const [connectionStatus, setConnectionStatus] =
    useState<QrScanConnectionStatus>('disconnected')

  // Held in a ref so it does not have to be an effect dependency. It is stable
  // for the life of the provider, but naming it in the deps meant any change
  // of identity would tear the socket down and build it again.
  const queryClientRef = useRef(queryClient)
  queryClientRef.current = queryClient

  useEffect(() => {
    if (!slug) {
      setScanCount(null)
      setConnectionStatus('disconnected')
      return undefined
    }

    // Per effect run, deliberately: this used to be a ref shared across runs
    // and reset to false at the top of each one. React mounts an effect twice
    // in development, so the first run's socket closed *after* the second run
    // had already reset the flag — its onclose therefore did not bail out, it
    // scheduled a reconnect. That reconnect closed the live socket, whose
    // onclose scheduled another, and so on: a permanent reconnect loop at one
    // per second per code, which on a dashboard of eight was eight new
    // connections a second, forever. A closure variable cannot be revived by a
    // later run, so a dead run stays dead.
    let cancelled = false
    let socket: WebSocket | null = null
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null
    let attempt = 0

    const connect = () => {
      if (cancelled) return
      setConnectionStatus('connecting')

      const ws = new WebSocket(qrScanWebSocketUrl(slug))
      socket = ws

      ws.onopen = () => {
        if (cancelled) return
        attempt = 0
        setConnectionStatus('connected')
      }

      ws.onmessage = (event) => {
        if (cancelled) return
        try {
          const data: unknown = JSON.parse(event.data)
          if (!isScanCountMessage(data) || data.slug !== slug) return
          setScanCount(data.scan_count)
          patchScanCountInCache(queryClientRef.current, slug, data.scan_count)
        } catch {
          // Ignore malformed messages.
        }
      }

      ws.onerror = () => {
        if (cancelled) return
        setConnectionStatus('error')
      }

      ws.onclose = () => {
        if (cancelled) return
        setConnectionStatus('disconnected')
        const delay = Math.min(1000 * 2 ** attempt, 30000)
        attempt += 1
        reconnectTimer = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      cancelled = true
      if (reconnectTimer) clearTimeout(reconnectTimer)
      if (socket) {
        // Detach first. Closing deliberately would otherwise run the reconnect
        // path and put back the socket we are here to take away.
        socket.onopen = null
        socket.onmessage = null
        socket.onerror = null
        socket.onclose = null
        socket.close()
      }
      socket = null
    }
  }, [slug])

  return { scanCount, connectionStatus }
}

export function connectionStatusLabel(
  status: QrScanConnectionStatus,
): string {
  switch (status) {
    case 'connecting':
      return 'Connecting...'
    case 'connected':
      return 'Live'
    case 'error':
    case 'disconnected':
    default:
      return 'Disconnected'
  }
}
