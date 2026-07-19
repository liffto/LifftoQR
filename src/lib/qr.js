// Maps a `design` object (see store.defaultDesign) to qr-code-styling options,
// and exposes the metadata that the design controls render from.

import { findEncoder, encodeContent } from './qrEncoders'
import { SHORT_BASE_URL, shortUrlAbsolute } from './store'

// --- inline SVG brand logos (data URLs so they embed cleanly in the QR) ----

const svg = (markup) => `data:image/svg+xml;utf8,${encodeURIComponent(markup)}`

// Wrap brand artwork on a white rounded background so it reads clearly as a
// QR-centre logo and as a picker tile. `inner` is scaled to fit via its viewBox.
const brand = (viewBox, inner, pad = 8) =>
  svg(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" rx="10" fill="#fff"/><svg x="${pad}" y="${pad}" width="${48 - pad * 2}" height="${48 - pad * 2}" viewBox="${viewBox}" preserveAspectRatio="xMidYMid meet">${inner}</svg></svg>`,
  )

const COMPANY = svg(`
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
  <rect width="48" height="48" rx="10" fill="#EEF3FE"/>
  <rect x="12" y="16" width="14" height="22" rx="1.5" fill="#1B59F5"/>
  <rect x="22" y="22" width="14" height="16" rx="1.5" fill="#3b82f6" opacity="0.8"/>
  <rect x="15" y="19" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="19.5" y="19" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="15" y="24" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="19.5" y="24" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="15" y="29" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="19.5" y="29" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="25" y="25" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="29.5" y="25" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="25" y="30" width="2.5" height="2.5" rx="0.5" fill="white"/>
  <rect x="29.5" y="30" width="2.5" height="2.5" rx="0.5" fill="white"/>
</svg>`)

const GOOGLE = brand(
  '-3 0 262 262',
  `<path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4"/><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853"/><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05"/><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335"/>`,
)

const MAPS = brand(
  '0 0 92.3 132.3',
  `<path fill="#1a73e8" d="M60.2 2.2C55.8.8 51 0 46.1 0 32 0 19.3 6.4 10.8 16.5l21.8 18.3L60.2 2.2z"/><path fill="#ea4335" d="M10.8 16.5C4.1 24.5 0 34.9 0 46.1c0 8.7 1.7 15.7 4.6 22l28-33.3-21.8-18.3z"/><path fill="#4285f4" d="M46.2 28.5c9.8 0 17.7 7.9 17.7 17.7 0 4.3-1.6 8.3-4.2 11.4 0 0 13.9-16.6 27.5-32.7-5.6-10.8-15.3-19-27-22.7L32.6 34.8c3.3-3.8 8.1-6.3 13.6-6.3"/><path fill="#fbbc04" d="M46.2 63.8c-9.8 0-17.7-7.9-17.7-17.7 0-4.3 1.5-8.3 4.1-11.3l-28 33.3c4.8 10.6 12.8 19.2 21 29.9l34.1-40.5c-3.3 3.9-8.1 6.3-13.5 6.3"/><path fill="#34a853" d="M59.1 109.2c15.4-24.1 33.3-35 33.3-63 0-7.7-1.9-14.9-5.2-21.3L25.6 98c2.6 3.4 5.3 7.3 7.9 11.3 9.4 14.5 6.8 23.1 12.8 23.1s3.4-8.7 12.8-23.2"/>`,
  6,
)

const WHATSAPP = brand(
  '0 0 48 48',
  `<g transform="translate(-700,-360)" fill="#67C15E" fill-rule="evenodd"><path d="M723.993033,360 C710.762252,360 700,370.765287 700,383.999801 C700,389.248451 701.692661,394.116025 704.570026,398.066947 L701.579605,406.983798 L710.804449,404.035539 C714.598605,406.546975 719.126434,408 724.006967,408 C737.237748,408 748,397.234315 748,384.000199 C748,370.765685 737.237748,360.000398 724.006967,360.000398 L723.993033,360.000398 L723.993033,360 Z M717.29285,372.190836 C716.827488,371.07628 716.474784,371.034071 715.769774,371.005401 C715.529728,370.991464 715.262214,370.977527 714.96564,370.977527 C714.04845,370.977527 713.089462,371.245514 712.511043,371.838033 C711.806033,372.557577 710.056843,374.23638 710.056843,377.679202 C710.056843,381.122023 712.567571,384.451756 712.905944,384.917648 C713.258648,385.382743 717.800808,392.55031 724.853297,395.471492 C730.368379,397.757149 732.00491,397.545307 733.260074,397.27732 C735.093658,396.882308 737.393002,395.527239 737.971421,393.891043 C738.54984,392.25405 738.54984,390.857171 738.380255,390.560912 C738.211068,390.264652 737.745308,390.095816 737.040298,389.742615 C736.335288,389.389811 732.90737,387.696673 732.25849,387.470894 C731.623543,387.231179 731.017259,387.315995 730.537963,387.99333 C729.860819,388.938653 729.198006,389.89831 728.661785,390.476494 C728.238619,390.928051 727.547144,390.984595 726.969123,390.744481 C726.193254,390.420348 724.021298,389.657798 721.340985,387.273388 C719.267356,385.42535 717.856938,383.125756 717.448104,382.434484 C717.038871,381.729275 717.405907,381.319529 717.729948,380.938852 C718.082653,380.501232 718.421026,380.191036 718.77373,379.781688 C719.126434,379.372738 719.323884,379.160897 719.549599,378.681068 C719.789645,378.215575 719.62006,377.735746 719.450874,377.382942 C719.281687,377.030139 717.871269,373.587317 717.29285,372.190836 Z"/></g>`,
  6,
)

const INSTAGRAM = brand(
  '0 0 32 32',
  `<rect x="2" y="2" width="28" height="28" rx="6" fill="url(#ig0)"/><rect x="2" y="2" width="28" height="28" rx="6" fill="url(#ig1)"/><rect x="2" y="2" width="28" height="28" rx="6" fill="url(#ig2)"/><path d="M23 10.5C23 11.3284 22.3284 12 21.5 12C20.6716 12 20 11.3284 20 10.5C20 9.67157 20.6716 9 21.5 9C22.3284 9 23 9.67157 23 10.5Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M16 21C18.7614 21 21 18.7614 21 16C21 13.2386 18.7614 11 16 11C13.2386 11 11 13.2386 11 16C11 18.7614 13.2386 21 16 21ZM16 19C17.6569 19 19 17.6569 19 16C19 14.3431 17.6569 13 16 13C14.3431 13 13 14.3431 13 16C13 17.6569 14.3431 19 16 19Z" fill="white"/><path fill-rule="evenodd" clip-rule="evenodd" d="M6 15.6C6 12.2397 6 10.5595 6.65396 9.27606C7.2292 8.14708 8.14708 7.2292 9.27606 6.65396C10.5595 6 12.2397 6 15.6 6H16.4C19.7603 6 21.4405 6 22.7239 6.65396C23.8529 7.2292 24.7708 8.14708 25.346 9.27606C26 10.5595 26 12.2397 26 15.6V16.4C26 19.7603 26 21.4405 25.346 22.7239C24.7708 23.8529 23.8529 24.7708 22.7239 25.346C21.4405 26 19.7603 26 16.4 26H15.6C12.2397 26 10.5595 26 9.27606 25.346C8.14708 24.7708 7.2292 23.8529 6.65396 22.7239C6 21.4405 6 19.7603 6 16.4V15.6ZM15.6 8H16.4C18.1132 8 19.2777 8.00156 20.1779 8.0751C21.0548 8.14674 21.5032 8.27659 21.816 8.43597C22.5686 8.81947 23.1805 9.43139 23.564 10.184C23.7234 10.4968 23.8533 10.9452 23.9249 11.8221C23.9984 12.7223 24 13.8868 24 15.6V16.4C24 18.1132 23.9984 19.2777 23.9249 20.1779C23.8533 21.0548 23.7234 21.5032 23.564 21.816C23.1805 22.5686 22.5686 23.1805 21.816 23.564C21.5032 23.7234 21.0548 23.8533 20.1779 23.9249C19.2777 23.9984 18.1132 24 16.4 24H15.6C13.8868 24 12.7223 23.9984 11.8221 23.9249C10.9452 23.8533 10.4968 23.7234 10.184 23.564C9.43139 23.1805 8.81947 22.5686 8.43597 21.816C8.27659 21.5032 8.14674 21.0548 8.0751 20.1779C8.00156 19.2777 8 18.1132 8 16.4V15.6C8 13.8868 8.00156 12.7223 8.0751 11.8221C8.14674 10.9452 8.27659 10.4968 8.43597 10.184C8.81947 9.43139 9.43139 8.81947 10.184 8.43597C10.4968 8.27659 10.9452 8.14674 11.8221 8.0751C12.7223 8.00156 13.8868 8 15.6 8Z" fill="white"/><defs><radialGradient id="ig0" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(12 23) rotate(-55.3758) scale(25.5196)"><stop stop-color="#B13589"/><stop offset="0.79309" stop-color="#C62F94"/><stop offset="1" stop-color="#8A3AC8"/></radialGradient><radialGradient id="ig1" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(11 31) rotate(-65.1363) scale(22.5942)"><stop stop-color="#E0E8B7"/><stop offset="0.444662" stop-color="#FB8A2E"/><stop offset="0.71474" stop-color="#E2425C"/><stop offset="1" stop-color="#E2425C" stop-opacity="0"/></radialGradient><radialGradient id="ig2" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(0.500002 3) rotate(-8.1301) scale(38.8909 8.31836)"><stop offset="0.156701" stop-color="#406ADC"/><stop offset="0.467799" stop-color="#6A45BE"/><stop offset="1" stop-color="#6A45BE" stop-opacity="0"/></radialGradient></defs>`,
  5,
)

const WIFI = brand(
  '0 0 24 24',
  `<path d="M8.34277 14.5899C8.80861 14.0903 9.37187 13.6915 9.9978 13.418C10.6237 13.1446 11.2995 13.0025 11.9826 13.0001C12.6656 12.9977 13.3419 13.1353 13.9697 13.4044C14.5975 13.6735 15.1637 14.0683 15.633 14.5646M6.14941 11.5439C6.89476 10.7446 7.79597 10.1066 8.79745 9.66902C9.79893 9.23148 10.8793 9.00389 11.9721 9.00007C13.065 8.99626 14.1466 9.21651 15.1511 9.64704C16.1556 10.0776 17.0617 10.7094 17.8127 11.5035M3.22363 8.81635C4.34165 7.61742 5.69347 6.66028 7.19569 6.00398C8.69791 5.34768 10.3179 5.0058 11.9572 5.00007C13.5966 4.99435 15.2208 5.32472 16.7276 5.97052C18.2344 6.61632 19.5931 7.56458 20.7195 8.75568M12 19.0001C11.4477 19.0001 11 18.5524 11 18.0001C11 17.4478 11.4477 17.0001 12 17.0001C12.5523 17.0001 13 17.4478 13 18.0001C13 18.5524 12.5523 19.0001 12 19.0001Z" stroke="#000000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>`,
)

export const LOGO_OPTIONS = [
  { key: 'instagram', label: 'Instagram', image: INSTAGRAM },
  { key: 'whatsapp', label: 'WhatsApp', image: WHATSAPP },
  { key: 'maps', label: 'Maps', image: MAPS },
  { key: 'wifi', label: 'WiFi', image: WIFI },
  { key: 'google', label: 'Google', image: GOOGLE },
  { key: 'company', label: 'Company', image: COMPANY },
]

export const logoImage = (logo) => {
  if (!logo) return undefined
  if (logo.startsWith('data:') || logo.startsWith('http')) return logo
  const match = LOGO_OPTIONS.find((o) => o.key === logo)
  return match ? match.image : undefined
}

// --- body patterns (qr-code-styling dot types) ----------------------------

export const PATTERN_OPTIONS = [
  { key: 'square', type: 'square' },
  { key: 'dots', type: 'dots' },
  { key: 'rounded', type: 'rounded' },
  { key: 'classy', type: 'classy' },
  { key: 'classy-rounded', type: 'classy-rounded' },
  { key: 'extra-rounded', type: 'extra-rounded' },
]

// --- corner styles --------------------------------------------------------
// cornersSquareOptions.type: 'square' | 'dot' | 'extra-rounded'
// cornersDotOptions.type:    'square' | 'dot'
export const CORNER_OPTIONS = [
  { square: 'square', dot: 'square' },
  { square: 'square', dot: 'dot' },
  { square: 'dot', dot: 'square' },
  { square: 'dot', dot: 'dot' },
  { square: 'extra-rounded', dot: 'square' },
  { square: 'extra-rounded', dot: 'dot' },
  { square: 'extra-rounded', dot: 'square' },
  { square: 'square', dot: 'dot' },
  { square: 'extra-rounded', dot: 'dot' },
  { square: 'dot', dot: 'dot' },
]

// --- frames ---------------------------------------------------------------
// Each frame has a `style` field consumed by QRView to render distinctly.
export const FRAME_OPTIONS = [
  { key: 'none', label: 'None', style: 'none' },
  { key: 'border', label: 'Border', style: 'border-only' },
  {
    key: 'classic',
    label: 'Classic',
    style: 'box-bar',
    position: 'bottom',
    text: 'SCAN ME',
  },
  {
    key: 'top',
    label: 'Top Bar',
    style: 'box-bar',
    position: 'top',
    text: 'SCAN ME',
  },
  {
    key: 'rounded',
    label: 'Rounded',
    style: 'rounded-box',
    position: 'bottom',
    text: 'SCAN ME',
  },
  {
    key: 'pill',
    label: 'Pill',
    style: 'pill-label',
    position: 'bottom',
    text: 'SCAN ME',
  },
  {
    key: 'banner',
    label: 'Banner',
    style: 'banner',
    position: 'bottom',
    text: 'SCAN ME',
  },
]

const gradient = (c1, c2) => ({
  type: 'linear',
  rotation: Math.PI / 4,
  colorStops: [
    { offset: 0, color: c1 },
    { offset: 1, color: c2 },
  ],
})

// --- build qr-code-styling options ----------------------------------------

// Resolve the actual string a QR encodes for a record.
// - Dynamic codes always encode the short redirect URL — scanning routes
//   through our site, which then redirects or renders a branded landing page
//   (Save Contact, links list, etc.). This is what makes them editable/trackable.
// - Static codes encode the real, scannable payload (WIFI:, vCard, mailto:, …).
// - Legacy records (no typeKey) keep the original URL behaviour.
export const buildPayload = (record) => {
  if (record?.dynamic && record?.slug) {
    return shortUrlAbsolute(record.slug)
  }
  const typeKey = record?.typeKey
  const t = typeKey ? findEncoder(typeKey) : null
  if (t) {
    return (
      encodeContent(typeKey, record.content || {}) ||
      record?.url ||
      SHORT_BASE_URL
    )
  }
  return record?.url || SHORT_BASE_URL
}

export const buildQRConfig = (record, size = 280) => {
  const design = record?.design || {}
  const data = buildPayload(record)

  const pattern =
    PATTERN_OPTIONS.find((p) => p.key === design.bodyPattern) ||
    PATTERN_OPTIONS[0]
  const corner = CORNER_OPTIONS[design.cornerStyle ?? 0] || CORNER_OPTIONS[0]
  const image = logoImage(design.logo)

  return {
    width: size,
    height: size,
    type: 'svg',
    data,
    image,
    // Margin must scale with size — a fixed margin starves small thumbnails of
    // pixels and collapses the module size to 0 (blank QR).
    margin: Math.max(1, Math.round(size * 0.035)),
    qrOptions: { errorCorrectionLevel: image ? 'H' : 'Q' },
    imageOptions: {
      hideBackgroundDots: true,
      imageSize: design.logoSize ?? 0.4,
      margin: 4,
      crossOrigin: 'anonymous',
    },
    dotsOptions: {
      type: pattern.type,
      color: design.bodyColor1 || '#000000',
      ...(design.bodyGradient
        ? { gradient: gradient(design.bodyColor1, design.bodyColor2) }
        : {}),
    },
    backgroundOptions: { color: design.background || '#FFFFFF' },
    cornersSquareOptions: {
      type: corner.square,
      color: design.cornerColor1 || design.bodyColor1 || '#000000',
      ...(design.cornerGradient
        ? { gradient: gradient(design.cornerColor1, design.cornerColor2) }
        : {}),
    },
    cornersDotOptions: {
      type: corner.dot,
      color: design.cornerColor1 || design.bodyColor1 || '#000000',
    },
  }
}

export const DOWNLOAD_FORMATS = ['PNG', 'JPEG', 'SVG', 'WEBP']
