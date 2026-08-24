import { defaultDesign } from '../lib/store'
import QRView from './QRView'
import LazyMount from './LazyMount'

// Design range, proven. Every tile is a real code rendered by the same engine the
// studio uses — not an illustration — so the wall itself is the argument.

const mk = (design, url = 'https://liffto.com') => ({
  typeKey: 'url',
  dynamic: false,
  content: { url },
  url,
  design: { ...defaultDesign(), ...design },
})

const GALLERY = [
  mk({
    bodyPattern: 'classy-rounded',
    cornerStyle: 8,
    bodyGradient: true,
    bodyColor1: '#1B59F5',
    bodyColor2: '#16C2C8',
    cornerColor1: '#1B59F5',
    logo: 'company',
  }),
  mk({
    bodyPattern: 'dots',
    cornerStyle: 3,
    bodyColor1: '#1F2430',
    cornerColor1: '#1B59F5',
    logo: 'whatsapp',
  }),
  mk({
    bodyPattern: 'extra-rounded',
    cornerStyle: 4,
    bodyGradient: true,
    bodyColor1: '#7C3AED',
    bodyColor2: '#EC4899',
    cornerColor1: '#7C3AED',
    logo: 'instagram',
  }),
  mk({
    bodyPattern: 'rounded',
    cornerStyle: 6,
    bodyColor1: '#16A34A',
    cornerColor1: '#065F46',
    logo: 'wifi',
  }),
  mk({
    bodyPattern: 'classy',
    cornerStyle: 2,
    bodyColor1: '#0F172A',
    cornerColor1: '#1B59F5',
    logo: 'maps',
  }),
  mk({
    bodyPattern: 'square',
    cornerStyle: 0,
    bodyColor1: '#000000',
  }),
  mk({
    bodyPattern: 'extra-rounded',
    cornerStyle: 9,
    bodyGradient: true,
    bodyColor1: '#F59E0B',
    bodyColor2: '#EF4444',
    cornerColor1: '#B45309',
    logo: 'google',
  }),
  mk({
    bodyPattern: 'classy-rounded',
    cornerStyle: 5,
    bodyGradient: true,
    bodyColor1: '#0EA5E9',
    bodyColor2: '#1B59F5',
    cornerColor1: '#0369A1',
  }),
]

export default function QrGalleryWall() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {GALLERY.map((record, i) => (
        <div
          key={i}
          className="group rounded-2xl bg-white p-4 sm:p-5 shadow-card ring-1 ring-black/[0.04] transition-all duration-300 hover:-translate-y-1 hover:shadow-panel"
        >
          <div className="flex items-center justify-center">
            <LazyMount width={104} height={104}>
              <QRView record={record} size={104} />
            </LazyMount>
          </div>
        </div>
      ))}
    </div>
  )
}
