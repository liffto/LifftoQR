import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import QRCodeStyling from 'qr-code-styling'
import { buildQRConfig } from '../lib/qr'

// Renders a live, styled QR for a record.
// Exposes `download(format, name)` via ref for the download buttons.
//
// IMPORTANT: qr-code-styling injects an <svg> into the holder <div> via direct
// DOM manipulation. To keep React's reconciler away from that subtree we memoize
// the holder element so its reference is stable across renders — React then
// skips reconciling its children. The wrapper structure MUST NOT change across
// renders (no conditional wrapper swaps), or the holder will unmount and lose
// the rendered QR.
const QRView = forwardRef(function QRView(
  { record, size = 280, className = '' },
  ref,
) {
  const holderRef = useRef(null)
  const instanceRef = useRef(null)
  const lastImageRef = useRef(undefined)

  const config = useMemo(() => buildQRConfig(record, size), [record, size])

  const mount = (qr) => {
    instanceRef.current = qr
    if (holderRef.current) {
      holderRef.current.innerHTML = ''
      qr.append(holderRef.current)
    }
  }

  useEffect(() => {
    lastImageRef.current = config.image
    mount(new QRCodeStyling(config))
    return () => {
      instanceRef.current = null
      if (holderRef.current) holderRef.current.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!instanceRef.current) return
    // qr-code-styling's .update() does NOT remove a previously-embedded logo,
    // so when the image is added/removed/swapped we recreate the instance.
    // Everything else (colours, patterns, corners, data) uses the cheap update.
    if (config.image !== lastImageRef.current) {
      lastImageRef.current = config.image
      mount(new QRCodeStyling(config))
    } else {
      instanceRef.current.update(config)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config])

  useImperativeHandle(ref, () => ({
    download: (format = 'PNG', name = 'qr-code') => {
      if (!instanceRef.current) return
      instanceRef.current.download({ name, extension: format.toLowerCase() })
    },
  }))

  const holder = useMemo(
    () => <div ref={holderRef} className={className} />,
    [className],
  )

  // Always the same structure — no conditional wrapper changes.
  return <div className="inline-flex">{holder}</div>
})

export default QRView
