import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
} from 'react'
import QRCodeStyling from 'qr-code-styling'
import { buildQRConfig, DOWNLOAD_SIZE } from '../lib/qr'
import {
  frameAddsNothing,
  frameGeometry,
  framedSvg,
  drawFramedCanvas,
} from '../lib/qrFrame'

// iOS Safari (including iPadOS, which reports as "Mac" but has touch) doesn't
// honor the <a download> trick qr-code-styling uses internally — it just opens
// the image in place instead of saving it. Detected once at module load since
// the UA/platform don't change during a session.
const isIOS =
  typeof navigator !== 'undefined' &&
  (/iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))

// Which parts of a config currently carry a gradient, as a comparable string.
//
// buildQRConfig omits the `gradient` key entirely when a design has none, and
// .update() merges rather than replaces — so an omitted key leaves the previous
// gradient in place. Reset a code away from a gradient template and the dots
// stayed filled with url(#dot-color-N), still wearing colours the design no
// longer had. Only presence is tracked: adding or removing one needs a fresh
// instance, while recolouring an existing gradient updates cleanly and happens
// on every drag of a colour picker.
const gradientShape = (config) =>
  [
    config.dotsOptions,
    config.cornersSquareOptions,
    config.cornersDotOptions,
    config.backgroundOptions,
  ]
    .map((opts) => (opts?.gradient ? '1' : '0'))
    .join('')

const MIME = {
  png: 'image/png',
  jpeg: 'image/jpeg',
  jpg: 'image/jpeg',
  webp: 'image/webp',
  svg: 'image/svg+xml',
}

const loadImage = (blob) =>
  new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      URL.revokeObjectURL(url)
      resolve(img)
    }
    img.onerror = (err) => {
      URL.revokeObjectURL(url)
      reject(err)
    }
    img.src = url
  })

// Render the code with its frame drawn around it.
//
// qr-code-styling has no concept of a frame, so it cannot produce this: it
// draws the code, and the frame is composited around the result. SVG exports
// nest the generated markup inside a frame built from the same measurements the
// preview uses; raster exports draw onto a canvas, which has the page's fonts
// and so gets the label in Poppins.
async function framedBlob(record, extension, size) {
  const design = record?.design || {}
  const opts = {
    frameKey: design.frame,
    text: design.frameText || 'SCAN ME',
    accent: design.bodyColor1 || '#1B59F5',
    background: design.background || '#FFFFFF',
    size,
  }

  const qr = new QRCodeStyling(buildQRConfig(record, size))

  if (extension === 'svg') {
    const raw = await qr.getRawData('svg')
    const markup = typeof raw === 'string' ? raw : await raw.text()
    return new Blob([framedSvg({ qrSvgMarkup: markup, ...opts })], {
      type: MIME.svg,
    })
  }

  const image = await loadImage(await qr.getRawData('png'))
  const geo = frameGeometry(opts.frameKey, size, opts.text)
  const canvas = document.createElement('canvas')
  canvas.width = geo.width
  canvas.height = geo.height
  const ctx = canvas.getContext('2d')
  // Null rather than throwing is a real possibility here: this canvas is a few
  // thousand pixels square, and a browser short of memory will decline. The
  // caller falls back to the plain export, so the worst case is a code without
  // its frame rather than a button that does nothing.
  if (!ctx) return null

  // Without this the label can be drawn before Poppins has loaded and come out
  // in the fallback face — the sort of thing that only shows up on a cold load.
  try {
    await document.fonts?.ready
  } catch {
    /* fonts API unavailable — the fallback face is still legible */
  }

  drawFramedCanvas(ctx, { qrImage: image, ...opts })
  return new Promise((resolve) =>
    canvas.toBlob(resolve, MIME[extension] || MIME.png, 0.92),
  )
}

const saveBlob = (blob, filename) => {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoked on a later turn of the loop; revoking immediately can cancel the
  // download in some browsers before it has read the blob.
  setTimeout(() => URL.revokeObjectURL(url), 10000)
}

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
  const lastGradientRef = useRef(undefined)

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
    lastGradientRef.current = gradientShape(config)
    mount(new QRCodeStyling(config))
    return () => {
      instanceRef.current = null
      if (holderRef.current) holderRef.current.innerHTML = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!instanceRef.current) return
    // .update() merges the new config over the old, so it can change a value
    // but never unset one. Two things are therefore expressed by their absence
    // and cannot survive the cheap path: a removed logo, and a removed gradient
    // — both leave the previous one showing. Recreate the instance for either.
    // Everything else (colours, patterns, corners, data) updates in place.
    const gradients = gradientShape(config)
    if (
      config.image !== lastImageRef.current ||
      gradients !== lastGradientRef.current
    ) {
      lastImageRef.current = config.image
      lastGradientRef.current = gradients
      mount(new QRCodeStyling(config))
    } else {
      instanceRef.current.update(config)
    }
  }, [config])

  useImperativeHandle(ref, () => ({
    download: async (format = 'PNG', name = 'qr-code') => {
      const extension = format.toLowerCase()

      // A framed code cannot come out of qr-code-styling, so it is composited
      // here and saved directly. SVG is built at the preview's own size since
      // it scales without loss; raster gets the full export size.
      //
      // If compositing cannot be done — no 2D context, a canvas the browser
      // will not encode — this falls through to the plain export below. A code
      // without its frame is a poor result; a download button that quietly does
      // nothing is a worse one.
      if (!frameAddsNothing(record?.design?.frame)) {
        let blob = null
        try {
          blob = await framedBlob(
            record,
            extension,
            extension === 'svg' ? size : DOWNLOAD_SIZE,
          )
        } catch {
          blob = null
        }

        if (blob) {
          const filename = `${name}.${extension}`
          if (isIOS && typeof navigator.share === 'function') {
            try {
              const file = new File([blob], filename, { type: blob.type })
              if (navigator.canShare?.({ files: [file] })) {
                await navigator.share({ files: [file], title: name })
                return
              }
            } catch (err) {
              if (err?.name === 'AbortError') return
            }
          }
          saveBlob(blob, filename)
          return
        }
      }

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
