import { FRAME_OPTIONS } from './qr'

// Drawing a frame around an exported QR code.
//
// Frames are React and CSS in the design page — QRFramePreview wraps the code
// in bordered divs. qr-code-styling knows nothing about them, so for a long
// time a frame was on-screen decoration and nothing else: pick one, download,
// and the file came back bare. This turns the same design into something that
// can be drawn into the exported image.
//
// The measurements below are the preview's, expressed as fractions of the code
// so they hold at any export size. QRFramePreview renders at 220px with a 3px
// border, 12px of padding, 10px bars around 11px text, and a 10px corner
// radius; each constant here is that pixel value over 220. Change one there and
// it wants changing here, which is the price of the frame living in two places
// — unavoidable while the preview is DOM and the export is not.

const R = (px) => px / 220

const PAD = R(12) // p-3 around the code
const BORDER = R(3) // border-[3px]
const RADIUS = R(10) // rounded-[10px]
const BAR_FONT = R(11) // text-[11px]
const BAR_PAD_Y = R(10) // py-2.5
const PILL_PAD_X = R(24) // px-6
const PILL_PAD_Y = R(6) // py-1.5
const PILL_GAP = R(4) // pb-1
const TRACKING = 0.18 // tracking-[0.18em], as a fraction of the font size
const LINE = 1.45 // what an 11px line box comes to in the preview

export const findFrame = (key) =>
  FRAME_OPTIONS.find((f) => f.key === (key || 'none')) || FRAME_OPTIONS[0]

// Rough advance width for the bold, uppercase, letter-spaced label. Only the
// pill needs it, to size the rounded rectangle behind the text; the bars run
// the full width and the text is centred in both. An estimate is enough, and
// keeps this module free of a canvas.
const estimateTextWidth = (text, fontSize) =>
  String(text || '').length * fontSize * (0.62 + TRACKING)

// Everything needed to draw the frame, in pixels, for a code of `size`.
// Coordinates are absolute within the exported image.
export function frameGeometry(frameKey, size, text = 'SCAN ME') {
  const f = findFrame(frameKey)
  const style = f.style

  const hasBorder = ['border-only', 'box-bar', 'rounded-box', 'banner'].includes(
    style,
  )
  const isRounded = ['border-only', 'rounded-box', 'banner'].includes(style)
  const topBar = style === 'banner' || (style === 'box-bar' && f.position === 'top')
  const bottomBar =
    style === 'banner' ||
    style === 'rounded-box' ||
    (style === 'box-bar' && f.position !== 'top')
  const pill = style === 'pill-label'

  const border = hasBorder ? BORDER * size : 0
  const pad = PAD * size
  const radius = isRounded ? RADIUS * size : 0
  const barFont = BAR_FONT * size
  const barHeight = 2 * BAR_PAD_Y * size + barFont * LINE

  const pillFont = barFont
  const pillHeight = 2 * PILL_PAD_Y * size + pillFont * LINE
  const pillWidth = pill
    ? estimateTextWidth(text, pillFont) + 2 * PILL_PAD_X * size
    : 0

  // The bordered box: border, then padding, then the code.
  const boxWidth = 2 * border + 2 * pad + size
  const boxHeight =
    2 * border +
    (topBar ? barHeight : 0) +
    2 * pad +
    size +
    (bottomBar ? barHeight : 0)

  // items-center means the column is as wide as its widest child, so a long
  // pill label widens the whole image rather than overflowing it.
  const width = Math.ceil(Math.max(boxWidth, pillWidth))
  const height = Math.ceil(boxHeight + (pill ? PILL_GAP * size + pillHeight : 0))

  const boxX = (width - boxWidth) / 2
  const qrX = boxX + border + pad
  const qrY = border + (topBar ? barHeight : 0) + pad

  // Bars sit inside the border and span its full inner width.
  const barX = boxX + border
  const barWidth = boxWidth - 2 * border

  return {
    style,
    width,
    height,
    size,
    qrX,
    qrY,
    border,
    radius,
    hasBorder,
    box: { x: boxX, y: 0, width: boxWidth, height: boxHeight },
    topBar: topBar
      ? { x: barX, y: border, width: barWidth, height: barHeight }
      : null,
    bottomBar: bottomBar
      ? {
          x: barX,
          y: boxHeight - border - barHeight,
          width: barWidth,
          height: barHeight,
        }
      : null,
    pill: pill
      ? {
          x: (width - pillWidth) / 2,
          y: boxHeight + PILL_GAP * size,
          width: pillWidth,
          height: pillHeight,
          radius: pillHeight / 2,
        }
      : null,
    font: {
      size: barFont,
      letterSpacing: TRACKING * barFont,
      // Poppins is what the preview uses. An exported SVG cannot carry it
      // without embedding the file, and an SVG rasterised through an <img>
      // cannot reach the page's copy either, so both fall back. The canvas
      // renderer draws with the page's own fonts and does get Poppins.
      family: "Poppins, 'Helvetica Neue', Helvetica, Arial, sans-serif",
      weight: 800,
    },
  }
}

export const frameAddsNothing = (frameKey) => findFrame(frameKey).style === 'none'

const escapeXml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Vertical placement for text centred in a bar: the middle, nudged by the cap
// height so it sits optically centred rather than sitting low.
const baselineIn = (rect, fontSize) => rect.y + rect.height / 2 + fontSize * 0.35

const labelSvg = (rect, text, geo) => {
  if (!rect) return ''
  return `<text x="${rect.x + rect.width / 2}" y="${baselineIn(rect, geo.font.size)}" text-anchor="middle" fill="#FFFFFF" font-family="${geo.font.family}" font-size="${geo.font.size}" font-weight="${geo.font.weight}" letter-spacing="${geo.font.letterSpacing}" xml:space="preserve">${escapeXml(String(text).toUpperCase())}</text>`
}

// The exported SVG: the frame drawn around the code's own SVG, nested at the
// size it was generated for so nothing is rescaled.
export function framedSvg({ qrSvgMarkup, frameKey, text, accent, background, size }) {
  const geo = frameGeometry(frameKey, size, text)
  const colour = accent || '#1B59F5'
  const bg = background || '#FFFFFF'

  // The inner <svg> keeps its own coordinate system; placing it at its natural
  // size means no scaling and no blur.
  const inner = qrSvgMarkup
    .replace(/^[\s\S]*?<svg/i, '<svg')
    .replace(/<svg/i, `<svg x="${geo.qrX}" y="${geo.qrY}"`)

  const parts = [
    `<rect x="0" y="0" width="${geo.width}" height="${geo.height}" fill="${bg}"/>`,
  ]

  if (geo.hasBorder) {
    // Stroke straddles the path, so inset by half to keep it inside the image.
    const half = geo.border / 2
    parts.push(
      `<rect x="${geo.box.x + half}" y="${half}" width="${geo.box.width - geo.border}" height="${geo.box.height - geo.border}" rx="${Math.max(0, geo.radius - half)}" fill="none" stroke="${colour}" stroke-width="${geo.border}"/>`,
    )
  }

  // Bars are clipped to the box's rounded corners, matching overflow-hidden.
  const clipId = 'liffto-frame-clip'
  const needsClip = geo.radius > 0 && (geo.topBar || geo.bottomBar)
  if (needsClip) {
    parts.push(
      `<defs><clipPath id="${clipId}"><rect x="${geo.box.x + geo.border}" y="${geo.border}" width="${geo.box.width - 2 * geo.border}" height="${geo.box.height - 2 * geo.border}" rx="${Math.max(0, geo.radius - geo.border)}"/></clipPath></defs>`,
    )
  }

  const bars = [geo.topBar, geo.bottomBar]
    .filter(Boolean)
    .map(
      (r) =>
        `<rect x="${r.x}" y="${r.y}" width="${r.width}" height="${r.height}" fill="${colour}"/>`,
    )
    .join('')
  if (bars) {
    parts.push(needsClip ? `<g clip-path="url(#${clipId})">${bars}</g>` : bars)
  }

  parts.push(inner)

  ;[geo.topBar, geo.bottomBar].forEach((r) => {
    if (r) parts.push(labelSvg(r, text, geo))
  })

  if (geo.pill) {
    parts.push(
      `<rect x="${geo.pill.x}" y="${geo.pill.y}" width="${geo.pill.width}" height="${geo.pill.height}" rx="${geo.pill.radius}" fill="${colour}"/>`,
    )
    parts.push(labelSvg(geo.pill, text, geo))
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${geo.width}" height="${geo.height}" viewBox="0 0 ${geo.width} ${geo.height}">${parts.join('')}</svg>`
}

const roundedRectPath = (ctx, x, y, w, h, r) => {
  const radius = Math.min(r, w / 2, h / 2)
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.arcTo(x + w, y, x + w, y + h, radius)
  ctx.arcTo(x + w, y + h, x, y + h, radius)
  ctx.arcTo(x, y + h, x, y, radius)
  ctx.arcTo(x, y, x + w, y, radius)
  ctx.closePath()
}

// The raster path. Drawn on a canvas rather than by rasterising the SVG above,
// because a canvas uses the fonts the page has loaded — so the label comes out
// in Poppins, as the preview shows it. An SVG loaded through an <img> is a
// separate document and cannot reach them.
export function drawFramedCanvas(ctx, { qrImage, frameKey, text, accent, background, size }) {
  const geo = frameGeometry(frameKey, size, text)
  const colour = accent || '#1B59F5'

  ctx.fillStyle = background || '#FFFFFF'
  ctx.fillRect(0, 0, geo.width, geo.height)

  const drawBar = (r) => {
    if (!r) return
    ctx.fillStyle = colour
    ctx.fillRect(r.x, r.y, r.width, r.height)
  }

  ctx.save()
  if (geo.radius > 0 && (geo.topBar || geo.bottomBar)) {
    roundedRectPath(
      ctx,
      geo.box.x + geo.border,
      geo.border,
      geo.box.width - 2 * geo.border,
      geo.box.height - 2 * geo.border,
      Math.max(0, geo.radius - geo.border),
    )
    ctx.clip()
  }
  drawBar(geo.topBar)
  drawBar(geo.bottomBar)
  ctx.restore()

  if (geo.hasBorder) {
    const half = geo.border / 2
    ctx.strokeStyle = colour
    ctx.lineWidth = geo.border
    roundedRectPath(
      ctx,
      geo.box.x + half,
      half,
      geo.box.width - geo.border,
      geo.box.height - geo.border,
      Math.max(0, geo.radius - half),
    )
    ctx.stroke()
  }

  if (qrImage) ctx.drawImage(qrImage, geo.qrX, geo.qrY, size, size)

  const label = String(text ?? 'SCAN ME').toUpperCase()
  ctx.fillStyle = '#FFFFFF'
  ctx.font = `${geo.font.weight} ${geo.font.size}px ${geo.font.family}`
  ctx.textAlign = 'center'
  ctx.textBaseline = 'alphabetic'
  // letterSpacing is not universally supported; where it is missing the label
  // is merely a little tighter than the preview, which is not worth a manual
  // per-character layout.
  if ('letterSpacing' in ctx) ctx.letterSpacing = `${geo.font.letterSpacing}px`

  ;[geo.topBar, geo.bottomBar].forEach((r) => {
    if (r) ctx.fillText(label, r.x + r.width / 2, baselineIn(r, geo.font.size))
  })

  if (geo.pill) {
    ctx.fillStyle = colour
    roundedRectPath(
      ctx,
      geo.pill.x,
      geo.pill.y,
      geo.pill.width,
      geo.pill.height,
      geo.pill.radius,
    )
    ctx.fill()
    ctx.fillStyle = '#FFFFFF'
    ctx.fillText(
      label,
      geo.pill.x + geo.pill.width / 2,
      baselineIn(geo.pill, geo.font.size),
    )
  }

  return geo
}
