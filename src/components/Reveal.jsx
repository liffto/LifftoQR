import { useEffect, useRef, useState } from 'react'

// Scroll-entrance reveal.
//
// Visibility never depends on this component doing anything: the default state
// is visible, and the animation is only *added* to elements that scroll into
// view later. So if JS is disabled, IntersectionObserver misbehaves, the
// compositor throttles animations, or a crawler renders the page, every section
// is still there.
//
// Content already on screen at mount (the hero) is deliberately left
// un-animated — instant is the better first impression, and it keeps the
// largest contentful paint honest.
export default function Reveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null)
  const [animate, setAnimate] = useState(false)

  useEffect(() => {
    const reduced =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (reduced || !el || typeof IntersectionObserver === 'undefined') {
      return undefined
    }

    // Already visible — show it as-is rather than fading something the visitor
    // is already looking at.
    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) return undefined

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setAnimate(true)
            io.disconnect()
          }
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.02 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`reveal ${animate ? 'reveal-in' : ''} ${className}`}
      style={animate && delay ? { animationDelay: `${delay}ms` } : undefined}
    >
      {children}
    </div>
  )
}
