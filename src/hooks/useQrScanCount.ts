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
  const reconnectAttemptRef = useRef(0)
  const unmountedRef = useRef(false)
  const socketRef = useRef<WebSocket | null>(null)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    unmountedRef.current = false

    if (!slug) {
      setScanCount(null)
      setConnectionStatus('disconnected')
      return () => {
        unmountedRef.current = true
      }
    }

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }
    }

    const connect = () => {
      if (unmountedRef.current) return

      clearReconnectTimer()
      socketRef.current?.close()
      setConnectionStatus('connecting')

      const socket = new WebSocket(qrScanWebSocketUrl(slug))
      socketRef.current = socket

      socket.onopen = () => {
        if (unmountedRef.current) return
        reconnectAttemptRef.current = 0
        setConnectionStatus('connected')
      }

      socket.onmessage = (event) => {
        if (unmountedRef.current) return
        try {
          const data: unknown = JSON.parse(event.data)
          if (!isScanCountMessage(data) || data.slug !== slug) return

          setScanCount(data.scan_count)
          patchScanCountInCache(queryClient, slug, data.scan_count)
        } catch {
          // Ignore malformed messages.
        }
      }

      socket.onerror = () => {
        if (unmountedRef.current) return
        setConnectionStatus('error')
      }

      socket.onclose = () => {
        if (unmountedRef.current) return
        setConnectionStatus('disconnected')

        const delay = Math.min(1000 * 2 ** reconnectAttemptRef.current, 30000)
        reconnectAttemptRef.current += 1
        reconnectTimerRef.current = setTimeout(connect, delay)
      }
    }

    connect()

    return () => {
      unmountedRef.current = true
      clearReconnectTimer()
      socketRef.current?.close()
      socketRef.current = null
    }
  }, [slug, queryClient])

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
