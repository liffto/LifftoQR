import fullLogo from '../assets/liffto-logo-full.svg'
import fullLogoWhite from '../assets/liffto-logo-full-white.svg'

// The LIFFTO wordmark. Referenced as a file rather than inlined as JSX: the
// artwork is ~105KB, which belongs in a cached static asset, not in the JS
// bundle. That rules out currentColor, hence the two-file black/white split.
//
// white: true = the white artwork, for dark backgrounds
export default function Logo({ size = 'md', white = false }) {
  // The artwork is 96x29.7, so height drives the size and width follows.
  // These were 28/34 when the box was 96x28; they scale with the taller box so
  // the wordmark itself renders at the same size and only the gap below grows.
  const height = size === 'lg' ? 36 : 30
  return (
    <img
      src={white ? fullLogoWhite : fullLogo}
      alt="Liffto — Create QR"
      height={height}
      style={{ height, width: 'auto' }}
      draggable={false}
    />
  )
}
