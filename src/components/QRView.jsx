import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import QRCodeStyling from 'qr-code-styling'
import { buildQRConfig } from '../lib/qr'

// On-screen previews are small (down to ~36px thumbnails), and qr-code-styling
// rasterizes PNG/JPEG/WEBP at the instance's render size — so downloading the
// preview directly produces a pixelated file. For raster exports we render a
// throwaway high-resolution instance instead, so the file is crisp for print.
const DOWNLOAD_SIZE = 2048

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
      const extension = format.toLowerCase()
      // SVG is vector — resolution-independent, so the on-screen instance is fine.
      if (extension === 'svg') {
        instanceRef.current?.download({ name, extension })
        return
      }
      // Raster formats: render a fresh high-resolution instance from the same
      // config so the exported image isn't limited to the preview size.
      const hiRes = new QRCodeStyling(buildQRConfig(record, DOWNLOAD_SIZE))
      hiRes.download({ name, extension })
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
