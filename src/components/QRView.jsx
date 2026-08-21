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

// iOS Safari (including iPadOS, which reports as "Mac" but has touch) doesn't
// honor the <a download> trick qr-code-styling uses internally — it just opens
// the image in place instead of saving it. Detected once at module load since
// the UA/platform don't change during a session.
const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

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
  }, [config])

  useImperativeHandle(ref, () => ({
    download: async (format = 'PNG', name = 'qr-code') => {
      const extension = format.toLowerCase()
      // SVG is vector — resolution-independent, so the on-screen instance is fine.
      // Raster formats render a fresh high-resolution instance from the same
      // config so the exported image isn't limited to the preview size.
      const source =
        extension === 'svg'
          ? instanceRef.current
          : new QRCodeStyling(buildQRConfig(record, DOWNLOAD_SIZE))

      if (isIOS && typeof navigator.share === 'function') {
        try {
          const blob = await source?.getRawData(extension)
          const file =
            blob &&
            new File([blob], `${name}.${extension}`, {
              type: blob.type || `image/${extension}`,
            })
          if (file && navigator.canShare?.({ files: [file] })) {
            await navigator.share({ files: [file], title: name })
            return
          }
        } catch (err) {
          // AbortError = user dismissed the share sheet — nothing to do.
          if (err?.name === 'AbortError') return
          // Otherwise fall through to the (broken-on-iOS) anchor download below
          // rather than leave the user with no result at all.
        }
      }

      source?.download({ name, extension })
    },
  }))

  const holder = useMemo(
    () => (
      <div
        ref={holderRef}
        className={`h-full w-full [&_svg]:block [&_svg]:h-full [&_svg]:w-full ${className}`}
      />
    ),
    [className],
  )

  // Always the same structure — no conditional wrapper changes.
  return (
    <div
      className="inline-flex shrink-0"
      style={{ width: size, height: size }}
    >
      {holder}
    </div>
  )
})

export default QRView
