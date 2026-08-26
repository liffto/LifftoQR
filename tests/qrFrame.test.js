import { describe, it, expect } from 'vitest'
import { frameGeometry, framedSvg, frameAddsNothing } from '../src/lib/qrFrame'

const S = 220 // the size QRFramePreview renders at, so the numbers are the CSS ones
const QR = '<svg width="220" height="220"><rect width="220" height="220"/></svg>'

const svgFor = (frameKey, over = {}) =>
  framedSvg({
    qrSvgMarkup: QR,
    frameKey,
    text: 'SCAN ME',
    accent: '#1B59F5',
    background: '#FFFFFF',
    size: S,
    ...over,
  })

describe('frame geometry', () => {
  it('knows when a frame draws nothing', () => {
    expect(frameAddsNothing('none')).toBe(true)
    expect(frameAddsNothing(undefined)).toBe(true)
    expect(frameAddsNothing('classic')).toBe(false)
  })

  it('matches the preview: 3px border, 12px padding around the code', () => {
    const g = frameGeometry('border', S)
    expect(g.width).toBe(2 * 3 + 2 * 12 + S)
    expect(g.height).toBe(g.width) // no bars, so square
    expect(g.qrX).toBeCloseTo(3 + 12, 5)
    expect(g.qrY).toBeCloseTo(3 + 12, 5)
  })

  it('adds a bar below for the classic frame and nothing above', () => {
    const g = frameGeometry('classic', S)
    expect(g.topBar).toBeNull()
    expect(g.bottomBar).not.toBeNull()
    expect(g.height).toBeGreaterThan(g.width)
    // the code does not move down when the bar is underneath it
    expect(g.qrY).toBeCloseTo(3 + 12, 5)
  })

  it('pushes the code down when the bar is above it', () => {
    const g = frameGeometry('top', S)
    expect(g.topBar).not.toBeNull()
    expect(g.bottomBar).toBeNull()
    expect(g.qrY).toBeCloseTo(3 + g.topBar.height + 12, 5)
  })

  it('gives the banner a bar at each end', () => {
    const banner = frameGeometry('banner', S)
    const single = frameGeometry('classic', S)
    expect(banner.topBar).not.toBeNull()
    expect(banner.bottomBar).not.toBeNull()
    expect(banner.height - single.height).toBeCloseTo(banner.topBar.height, 0)
  })

  it('drops the border for the pill frame and hangs the label below', () => {
    const g = frameGeometry('pill', S)
    expect(g.hasBorder).toBe(false)
    expect(g.border).toBe(0)
    expect(g.pill).not.toBeNull()
    expect(g.pill.y).toBeGreaterThan(g.qrY + S)
    expect(g.width).toBe(2 * 12 + S)
  })

  it('keeps the bars inside the border rather than across it', () => {
    const g = frameGeometry('classic', S)
    expect(g.bottomBar.x).toBeCloseTo(g.box.x + g.border, 5)
    expect(g.bottomBar.width).toBeCloseTo(g.box.width - 2 * g.border, 5)
    expect(g.bottomBar.y + g.bottomBar.height).toBeCloseTo(
      g.box.height - g.border,
      5,
    )
  })

  it('scales as one piece, so an export is the preview enlarged', () => {
    const small = frameGeometry('banner', S)
    const large = frameGeometry('banner', S * 4)
    expect(large.width / small.width).toBeCloseTo(4, 1)
    expect(large.height / small.height).toBeCloseTo(4, 1)
    expect(large.border / small.border).toBeCloseTo(4, 5)
    expect(large.font.size / small.font.size).toBeCloseTo(4, 5)
  })

  it('widens the image when the label is wider than the code', () => {
    const short = frameGeometry('pill', S, 'GO')
    const long = frameGeometry('pill', S, 'SCAN THIS CODE FOR THE FULL MENU')
    expect(long.width).toBeGreaterThan(short.width)
    expect(long.pill.x).toBeGreaterThanOrEqual(0)
  })
})

describe('the exported SVG', () => {
  it('carries the label, the bar and the code itself', () => {
    const svg = svgFor('classic')
    expect(svg).toMatch(/SCAN ME/)
    expect(svg).toMatch(/fill="#1B59F5"/)
    expect((svg.match(/<svg/g) || []).length).toBe(2) // frame plus nested code
  })

  it('declares the size the geometry asked for', () => {
    const g = frameGeometry('banner', S)
    const svg = svgFor('banner')
    expect(svg).toContain(`width="${g.width}"`)
    expect(svg).toContain(`height="${g.height}"`)
    expect(svg).toContain(`viewBox="0 0 ${g.width} ${g.height}"`)
  })

  it('places the code without rescaling it', () => {
    const g = frameGeometry('classic', S)
    expect(svgFor('classic')).toContain(`<svg x="${g.qrX}" y="${g.qrY}"`)
  })

  it('uppercases the label, as the preview does', () => {
    expect(svgFor('classic', { text: 'scan me' })).toMatch(/>SCAN ME</)
  })

  it('escapes the label, which is typed by the user', () => {
    // Frame text is a free field. Dropped into markup unescaped it would break
    // the file, and an exported SVG is a document someone may open in a browser.
    const svg = svgFor('classic', { text: '</text><script>alert(1)</script>' })
    expect(svg).not.toContain('<script>')
    expect(svg).toContain('&lt;')
  })

  it('paints a background, so a frame is not transparent behind the code', () => {
    // JPEG has no alpha at all, and a transparent margin looks broken on any
    // dark surface.
    expect(svgFor('classic', { background: '#FFEE00' })).toContain(
      'fill="#FFEE00"',
    )
  })
})
