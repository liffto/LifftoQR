import { Suspense, lazy, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Palette,
  RefreshCw,
  BarChart2,
  LayoutGrid,
  Download,
  BookmarkPlus,
  Check,
  ChevronDown,
  Sun,
  Moon,
  Zap,
  Menu,
  X,
  Frame,
  Printer,
} from 'lucide-react'
import { defaultDesign, getDraft } from '../lib/store'
import { useLoginModal } from '../context/LoginModalContext'
import {
  LOGO_OPTIONS,
  FRAME_STYLE_COUNT,
  PATTERN_OPTIONS,
  DOWNLOAD_FORMATS,
  DOWNLOAD_SIZE,
} from '../lib/qr'
import { startDraft, draftHasContent } from '../lib/qrDraft'
import { useTheme } from '../hooks/useTheme'
import { findType, SELECTABLE_QR_TYPES } from '../lib/qrTypes'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { QrTypeGrid } from '../components/QrQuickStart'
import HeroQrStudio from '../components/HeroQrStudio'
import DynamicSwapDemo from '../components/DynamicSwapDemo'
import QrGalleryWall from '../components/QrGalleryWall'
import StepStyleDemo from '../components/StepStyleDemo'
import QRView from '../components/QRView'
import LazyMount from '../components/LazyMount'
import Reveal from '../components/Reveal'
import Recognitions from '../components/Recognitions'
import { HOME_REGION } from '../lib/recognitions'
import { DEMO_PORTRAIT, DEMO_COMPANY_MARK } from '../assets/demoImages'

// The scan demos sit most of a page down, and the component brings react-icons
// with it for the brand marks — a whole icon set the visible part of this page
// never uses. Split out and warmed during idle time, so it is in place long
// before anyone scrolls to it.
const loadScanPreview = () => import('../components/ScanPreview')
const ScanPreview = lazy(loadScanPreview)

// Holds the section's shape open while the cards are still on their way, so
// nothing below them jumps. Shared by the prerender and the Suspense fallback —
// they have to be identical for hydration to match.
const SCAN_DEMO_PLACEHOLDER = (
  <div className="min-h-[420px] w-full" aria-busy="true" />
)

const NAV_LINKS = [
  { label: 'QR types', href: '#create' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
  // Worth a nav slot, not just a section someone scrolls past: "who is behind
  // this and where are they" is a question a visitor asks deliberately, and a
  // government reader arrives looking for exactly this.
  { label: 'About us', href: '#about' },
  { label: 'FAQ', href: '#faq' },
]

// The `ink` token flips to near-white in dark mode, so the editorial dark
// panels/buttons use fixed charcoal instead. Panels stay dark in both themes
// (a raised surface); solid buttons invert in dark mode to keep contrast.
const DARK_PANEL = 'bg-[#1F2430] text-white'
const DARK_BTN =
  'bg-[#1F2430] text-white hover:bg-[#2A3142] dark:bg-white dark:text-[#1F2430] dark:hover:bg-white/90'

// Sample records for the "what people see when they scan" mockups — rendered by
// the same ScanPreview the create flow uses, so these are the real pages.
//
// An invented person at an invented company, not anyone real: a landing page is
// an advert, and a name on it reads as a claim about who uses this. That goes
// for us too — the contact demo used to carry the founder's own name, number and
// email, which put a real personal phone number on a public marketing page and
// made the sample card read as "here is our card" rather than "here is yours".
const SCAN_DEMOS = [
  {
    label: 'Contact card',
    blurb: 'Saves to their phone in one tap',
    record: {
      typeKey: 'vcard',
      type: 'Contact Card',
      dynamic: true,
      slug: 'k4Rm2p',
      content: {
        firstName: 'Marcus',
        lastName: 'Hale',
        org: 'Northpine',
        title: 'Head of Partnerships',
        // Ofcom's range reserved for drama, so the demo cannot dial a stranger.
        phone: '+44 20 7946 0958',
        email: 'marcus@northpine.co',
        url: 'https://northpine.co',
        city: 'London',
        country: 'United Kingdom',
        photo: DEMO_PORTRAIT,
        logo: DEMO_COMPANY_MARK,
      },
    },
  },
  {
    label: 'Coupon',
    blurb: 'Redeemable at the counter',
    record: {
      typeKey: 'coupon',
      type: 'Coupon',
      dynamic: true,
      slug: 'sV9xq1',
      content: {
        title: '20% off your first order',
        code: 'WELCOME20',
        expiry: '2026-12-31',
        // The field is `description` everywhere else — the renderer reads that,
        // so the old `details` key meant this line never showed.
        description: 'Valid once per customer, in store or online.',
      },
    },
  },
]

// A styled code for the features lead cell — real output, not an illustration.
const FEATURE_QR = {
  typeKey: 'url',
  dynamic: false,
  content: { url: 'https://liffto.com' },
  url: 'https://liffto.com',
  design: {
    ...defaultDesign(),
    bodyPattern: 'extra-rounded',
    cornerStyle: 4,
    bodyGradient: true,
    bodyColor1: '#7C3AED',
    bodyColor2: '#1B59F5',
    cornerColor1: '#1B59F5',
    logo: 'company',
  },
}

// A handful of real types for the step-one visual. Offered ones only — a tile
// for something the picker no longer lists is an advert for a dead end.
const STEP_TYPES = ['url', 'wifi', 'vcard', 'whatsapp', 'coupon', 'event'].map(
  (k) => findType(k),
)

// Product facts, not invented usage numbers.
const STATS = [
  {
    icon: LayoutGrid,
    value: SELECTABLE_QR_TYPES.length,
    suffix: '',
    label: 'QR code types',
    caption: 'Links, WiFi, contacts, coupons & more',
  },
  {
    icon: Frame,
    value: FRAME_STYLE_COUNT,
    suffix: '',
    label: 'Frame styles',
    caption: 'Each with your own call-to-action',
  },
  {
    icon: Download,
    value: DOWNLOAD_FORMATS.length,
    suffix: '',
    label: 'Export formats',
    caption: DOWNLOAD_FORMATS.join(' · '),
  },
  {
    icon: Printer,
    value: DOWNLOAD_SIZE,
    suffix: 'px',
    label: 'Print resolution',
    caption: 'Sharp from a sticker to a storefront',
  },
]

// A number that races up to its value the first time it scrolls into view.
//
// Like Reveal, the animation is only ever an enhancement: the final value is
// what renders by default, so the prerendered HTML is correct, a reduced-motion
// visitor sees the number outright, and anything already on screen at mount is
// left settled rather than snapped back to zero. Only a number arriving from
// below the fold counts up.
function CountUp({ value, suffix = '', duration = 1100 }) {
  const ref = useRef(null)
  const [display, setDisplay] = useState(value)

  useEffect(() => {
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const el = ref.current
    if (reduced || !el || typeof IntersectionObserver === 'undefined') return undefined

    const rect = el.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) return undefined

    let raf
    let start
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return
        io.disconnect()
        setDisplay(0)
        const tick = (t) => {
          if (start == null) start = t
          const p = Math.min(1, (t - start) / duration)
          const eased = 1 - Math.pow(1 - p, 3) // easeOutCubic — fast, then settles
          setDisplay(Math.round(value * eased))
          if (p < 1) raf = requestAnimationFrame(tick)
        }
        raf = requestAnimationFrame(tick)
      },
      { threshold: 0.3 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      if (raf) cancelAnimationFrame(raf)
    }
  }, [value, duration])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
      {suffix}
    </span>
  )
}

const FEATURES = [
  {
    icon: Palette,
    tint: 'bg-primary/10 text-primary',
    title: 'A real design studio',
    body: `${PATTERN_OPTIONS.length} body patterns, corner styles, ${FRAME_STYLE_COUNT} frames with your own call-to-action, colours and gradients, plus a logo in the centre — with a live preview of every change.`,
  },
  {
    icon: RefreshCw,
    tint: 'bg-violet-50 text-violet-500 dark:bg-violet-400/15 dark:text-violet-300',
    title: 'Edit it after you print',
    body: 'Dynamic codes route through a short link you control, so a printed QR can point somewhere new at any time. No reprinting, no new sticker.',
  },
  {
    icon: BarChart2,
    tint: 'bg-success/10 text-success',
    title: 'Watch it get scanned',
    body: 'Every dynamic code counts its own scans, and the number moves on your dashboard as it happens. Switch one off the moment a campaign ends.',
  },
  {
    icon: LayoutGrid,
    tint: 'bg-amber-50 text-amber-500 dark:bg-amber-400/15 dark:text-amber-300',
    title: `${SELECTABLE_QR_TYPES.length} QR code types`,
    body: 'Links, Wi-Fi, contact cards, WhatsApp, email and SMS, coupons, events, app stores and a link tree — each with a guided form.',
  },
  {
    icon: Download,
    tint: 'bg-rose-50 text-rose-500 dark:bg-rose-400/15 dark:text-rose-300',
    title: 'Files a printer will accept',
    body: `PNG, JPEG and WEBP at ${DOWNLOAD_SIZE}px, or SVG vector that stays sharp from a business card to a shop front. No watermark on any of them.`,
  },
  {
    icon: BookmarkPlus,
    tint: 'bg-teal-50 text-teal-600 dark:bg-teal-400/15 dark:text-teal-300',
    title: 'Get your second code out faster',
    body: 'Save any design as a template and the next code wears it in one click. File them into folders, then search and filter from a table or a wall of cards.',
  },
]

const STEPS = [
  {
    title: 'Pick a type, add your content',
    body: `Start with a link right here, or choose from ${SELECTABLE_QR_TYPES.length} types. Every one has a guided form, and shows you the scan page while you fill it in.`,
  },
  {
    title: 'Make it look like you',
    body: 'Your logo in the middle, your colours, a pattern, and a frame that tells people what to do. The preview keeps up with every change.',
  },
  {
    title: 'Download it, and keep control',
    body: 'Take the print-ready files. Then change where a dynamic code points, pause it, or watch its scans — from the same dashboard, for as long as you want.',
  },
]

const FAQS = [
  {
    q: 'What is the difference between a dynamic and a static QR code?',
    a: 'A static code carries the destination inside the pattern itself, so once it is printed it can never change. A dynamic code carries a short link we host instead — the pattern stays the same forever while you change where it leads, count its scans, or switch it off. If what you are printing might ever need to point somewhere else, make it dynamic.',
  },
  {
    q: 'Do I need an account to create a QR code?',
    a: 'Not for a static code. Design it here, download it, and it is yours — no sign-in at any point. An account is only needed for a dynamic code, because that one routes through a short link we host so you can change where it points and see how often it is scanned.',
  },
  {
    q: 'Will my QR codes keep working?',
    a: 'Static codes work forever because the data lives in the image. Dynamic codes stay live as long as your account is active — and you keep control of where they point.',
  },
  {
    q: 'Can I put my own logo and colours on a code?',
    a: `Yes. Add a logo in the centre, set body and corner colours or a gradient, choose from ${PATTERN_OPTIONS.length} body patterns and ${FRAME_STYLE_COUNT} frames, then save the result as a template to reuse.`,
  },
  {
    q: 'What does it cost?',
    a: 'Nothing, and there is no paid tier waiting for you further in. Unlimited codes, dynamic QR, scan counts and every download format are on for every account. There is no card field anywhere in the product, and nothing we make is stamped with our name.',
  },
]

function FaqRow({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-6 py-6 text-left group"
      >
        <span className="text-[16px] sm:text-[17px] font-semibold text-ink group-hover:text-primary transition-colors leading-snug">
          {q}
        </span>
        <span
          className={`mt-0.5 w-7 h-7 rounded-full border border-line flex items-center justify-center shrink-0 transition-all ${
            open
              ? 'rotate-180 border-primary text-primary'
              : 'text-ink-faint group-hover:border-primary/40'
          }`}
        >
          <ChevronDown size={15} />
        </span>
      </button>
      {open && (
        <p className="pb-6 pr-12 text-[15px] text-ink-soft leading-relaxed max-w-2xl">
          {a}
        </p>
      )}
    </div>
  )
}

export default function Landing() {
  const navigate = useNavigate()
  const { openLogin } = useLoginModal()
  const { isAuthenticated } = useAuth()
  // Both of these start at the value the prerender necessarily produced. A
  // build has no localStorage, so the baked HTML is always the logged-out,
  // light-theme page; if the first client render disagreed, hydration would
  // find a mismatch and throw the markup away. They correct themselves in the
  // effect below, one frame later. The palette is never wrong in the meantime —
  // the inline script in index.html sets the dark class before the first paint,
  // so this is only about which icon and which label are showing.
  const [theme, onToggleTheme] = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Pull the scan demos down once the browser is idle, so they are ready by
  // the time anyone scrolls that far without competing with the first paint.
  useEffect(() => {
    const schedule = window.requestIdleCallback || ((fn) => setTimeout(fn, 2000))
    const cancel = window.cancelIdleCallback || clearTimeout
    const id = schedule(() => {
      loadScanPreview()
    })
    return () => cancel(id)
  }, [])

  const goToDashboard = () => {
    if (isAuthenticated) {
      navigate('/dashboard')
      return
    }
    openLogin('/dashboard')
  }

  const requireAuth = (target) => {
    if (isAuthenticated) {
      navigate(target)
      return
    }
    openLogin(target)
  }

  // Every way of starting a code funnels through here — the hero's own URL
  // button, its type picker, and the type grid further down — so this is the
  // one place that can notice a draft about to be thrown away.
  const handleStart = (
    typeKey,
    content,
    dynamicPref,
    target,
    designOverride,
  ) => {
    const existing = getDraft()
    // Only when switching to a different type, and only when the outgoing
    // draft holds something the visitor actually entered. Starting the same
    // type again, or replacing an untouched one, is not a loss worth stopping
    // for.
    if (
      existing &&
      existing.typeKey !== typeKey &&
      draftHasContent(existing) &&
      !window.confirm(
        `Your unfinished ${findType(existing.typeKey).label} code will be discarded if you start a ${findType(typeKey).label} code instead.\n\nDiscard it and continue?`,
      )
    ) {
      return
    }
    // Only a dynamic code needs an account: it resolves through a short link
    // we host, which we cannot create for someone who has none. A static code
    // is drawn and downloaded entirely in the browser, so gating it bought
    // nothing and cost every first-time visitor their momentum.
    //
    // startDraft returns the built record rather than echoing dynamicPref,
    // because some types force dynamic regardless of the toggle.
    const record = startDraft(typeKey, content, dynamicPref, designOverride)
    if (record.dynamic) {
      requireAuth(target)
      return
    }
    navigate(target)
  }

  const scrollTo = (id) => () => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const goCreateFlow = () => {
    requireAuth('/create')
  }

  // The hero is a dark slab, so the bar rides transparently over it and only
  // becomes a solid surface once the visitor has scrolled past it.
  const [solidNav, setSolidNav] = useState(false)
  useEffect(() => {
    const onScroll = () => setSolidNav(window.scrollY > 72)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The section links are desktop-only, which left a phone with no way to
  // reach Pricing or the FAQ short of scrolling the whole page.
  const [menuOpen, setMenuOpen] = useState(false)
  useEffect(() => {
    if (!menuOpen) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [menuOpen])

  return (
    <div className="min-h-screen bg-surface">
      {/* Ten sections sit below the header, so a keyboard user was tabbing the
          whole nav on every load to reach any of them. Off-screen until
          focused, then the first thing Tab lands on. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-[10px] focus:bg-primary focus:px-4 focus:py-2.5 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      {/* ══ NAV ═══════════════════════════════════════════════════════ */}
      {/* Rides transparently over the dark hero, then becomes a solid bar. */}
      <header
        className={`sticky top-0 z-40 transition-colors duration-300 ${
          solidNav
            ? 'bg-surface/90 backdrop-blur-md border-b border-line'
            : 'bg-transparent border-b border-white/10'
        }`}
      >
        <div className="max-w-[1200px] mx-auto h-[72px] px-5 sm:px-8 flex items-center">
          <button
            type="button"
            onClick={scrollTo('top')}
            aria-label="Liffto"
          >
            <Logo white={!solidNav} />
          </button>

          <nav className="hidden lg:flex flex-1 items-center justify-center gap-1">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className={`px-3.5 py-2 rounded-[10px] text-[14px] font-medium transition-colors ${
                  solidNav
                    ? 'text-ink-soft hover:text-ink hover:bg-canvas'
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="ml-auto lg:ml-0 flex items-center gap-2">
            <button
              type="button"
              onClick={onToggleTheme}
              aria-label={
                theme === 'dark'
                  ? 'Switch to light mode'
                  : 'Switch to dark mode'
              }
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              className={`w-11 h-11 rounded-[10px] flex items-center justify-center transition-colors ${
                solidNav
                  ? 'text-ink-muted hover:bg-canvas hover:text-ink'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            <button
              type="button"
              onClick={goToDashboard}
              className={`h-10 px-5 rounded-[10px] text-sm font-semibold transition-colors ${
                solidNav
                  ? DARK_BTN
                  : 'bg-white text-[#0B0F1A] hover:bg-white/90'
              }`}
            >
              {/* A signed-out visitor does not have a dashboard to go to, and
                  this is the only button in the header. */}
              {mounted && isAuthenticated ? 'Go to dashboard' : 'Sign in'}
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              aria-controls="mobile-nav"
              className={`flex h-11 w-11 items-center justify-center rounded-[10px] transition-colors lg:hidden ${
                solidNav
                  ? 'text-ink-muted hover:bg-canvas hover:text-ink'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              {menuOpen ? <X size={19} /> : <Menu size={19} />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div
            id="mobile-nav"
            className="border-t border-line bg-surface px-5 py-2 shadow-panel lg:hidden"
          >
            <nav className="flex flex-col">
              {NAV_LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-[10px] px-2 py-3 text-[15px] font-medium text-ink-soft transition-colors hover:bg-canvas hover:text-ink"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </div>
        )}
      </header>

      <main id="main">
        {/* ══ HERO ══════════════════════════════════════════════════════ */}
      {/* A dark slab in both themes: our codes are black-and-blue on white, so
          they read like product photography against it. */}
      <section
        id="top"
        className="relative -mt-[72px] overflow-hidden bg-[#0B0F1A]"
      >
        {/* Atmosphere: two colour glows plus a fine dot grid. */}
        <div
          aria-hidden
          className="pointer-events-none absolute -left-32 -top-40 h-[560px] w-[560px] rounded-full bg-primary/25 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 top-24 h-[460px] w-[460px] rounded-full bg-[#16C2C8]/15 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.16]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,.45) 1px, transparent 0)',
            backgroundSize: '34px 34px',
          }}
        />
        {/* Fade into the page below */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-black/25"
        />

        <div className="relative max-w-[1200px] mx-auto px-5 sm:px-8 pt-[136px] pb-20 sm:pb-28">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
            {/* Copy */}
            <div className="lg:col-span-7">
              <Reveal>
                <span className="inline-flex items-center gap-2 rounded-full bg-white/10 ring-1 ring-inset ring-white/15 px-3.5 py-1.5 text-[12px] font-semibold text-white/85 backdrop-blur">
                  <Zap size={12} className="text-[#7BE3DC]" />
                  Free — including the parts others charge for
                </span>

                {/* Three lines, three pillars: the studio, the dynamic short
                    link, the scan counter. An earlier version sold the first
                    two and never mentioned that anything is measured, so the
                    feature that brings someone back next week rather than once
                    was missing from the top of the page.

                    Noun first. "Design your QR code." opened on an imperative,
                    which tells a stranger what to do before it tells them what
                    this is; the category name earns that line, and "branded"
                    does the studio's work at the same time.

                    Every line is its own sentence and its own <br />, and each
                    is measured against the narrowest box it has to survive —
                    1024px, where this column is 537px against a 50px font, so
                    the budget is 10.74em. These run 9.12 / 8.62 / 8.46. The
                    version before this put a two-word gradient span across a
                    line end and left "after" alone on a line; a headline must
                    not depend on the box guessing right. No pronoun in line 2
                    on purpose — "edit them" is 11.43em and overflows, and
                    "edit it" disagrees with the plural above it.

                    "Track", not "count": a scan writes a row with a timestamp,
                    which is what the 30-day graph and the unique count are
                    built from, so there is something here worth the word. The
                    one thing it can be misread as is location, which is the
                    thing we genuinely do not collect — the analytics answer in
                    the FAQ says so outright, which is where that belongs. */}
                {/* The lg step is 50px, not 56px, because lg starts at 1024
                    where this column is only 537px wide — "Design your QR
                    code." needs 566px at 56px and wrapped, which is how the
                    previous headline ended up with a word stranded on a line
                    of its own. Full size returns at xl, where the column is
                    ~640px and every line has room. Measured, not guessed. */}
                <h1 className="mt-7 text-[clamp(27px,8vw,36px)] leading-[1.05] sm:text-[48px] lg:text-[50px] xl:text-[56px] lg:leading-[1.05] font-extrabold tracking-[-0.035em] text-white">
                  Branded QR codes.
                  <br />
                  <span className="bg-gradient-to-r from-[#7BA8FF] via-[#6EE7E0] to-[#7BA8FF] bg-clip-text text-transparent">
                    Edit after printing.
                  </span>
                  <br />
                  Track every scan.
                </h1>

                {/* Counted, not written down. "Sixteen more types" was true
                    when it was typed and silently stopped being true the moment
                    the list changed. */}
                {/* The headline has the three verbs, so this adds the two
                    things it has no room for: how much the code can be, and
                    that scanning one opens a page we host rather than dumping
                    someone on a redirect. */}
                <p className="mt-7 max-w-md text-[16px] sm:text-[17px] text-white/60 leading-relaxed">
                  Your logo in the middle, {SELECTABLE_QR_TYPES.length} types to
                  pick from — a link, your Wi-Fi, a contact card, a coupon. Scan
                  one and a branded page opens, built and hosted for you.
                </p>

                {/* Four negatives rather than three and a feature: the whole
                    claim of this page is what we do not do to you, and a list
                    that breaks its own rhythm at the last item stops sounding
                    like a promise. Every one is verifiable in the codebase —
                    no ad or tracker scripts ship, nothing is stamped onto the
                    downloaded code, and there is no billing path at all (see
                    Payment.jsx, which is a page explaining that). */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-white/55">
                  {[
                    'No watermark',
                    'No ads',
                    'No credit card',
                    'No trial timer',
                  ].map((t) => (
                    <span key={t} className="inline-flex items-center gap-2">
                      <Check size={14} className="text-[#6EE7E0]" />
                      {t}
                    </span>
                  ))}
                </div>

                {/* Logo presets — hidden on phones so the studio card stays near
                    the fold. */}
                <div className="mt-12 hidden lg:block">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/55">
                    Logo presets included
                  </p>
                  <div className="mt-4 flex items-center gap-5">
                    {LOGO_OPTIONS.filter((o) => o.key !== 'company').map(
                      (o) => (
                        <img
                          key={o.key}
                          src={o.image}
                          alt={o.label}
                          title={o.label}
                          className="h-9 w-9 rounded-[10px] bg-white/90 p-1.5 opacity-70 transition-all hover:opacity-100 hover:scale-105"
                        />
                      ),
                    )}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* A working slice of the studio, live */}
            <div className="lg:col-span-5">
              <Reveal delay={120}>
                <div className="relative mx-auto max-w-[440px]">
                  {/* Glow behind the card so it lifts off the slab */}
                  <div
                    aria-hidden
                    className="absolute -inset-6 rounded-[32px] bg-primary/20 blur-3xl"
                  />
                  <div className="relative drop-shadow-2xl">
                    <HeroQrStudio onStart={handleStart} />
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ══ GALLERY WALL ══════════════════════════════════════════════ */}
      <section className="bg-canvas border-b border-line">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <Reveal>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[560px]">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  The studio
                </span>
                {/* "One engine, endless looks" was the one unverifiable boast
                    on a page that otherwise counts everything. The honest
                    version is also the better hook: these are not screenshots
                    of codes, they are codes, drawn in the browser as you read
                    this — which is the proof that the studio is real. */}
                <h2 className="mt-3 text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
                  None of these are pictures
                </h2>
              </div>
              <p className="text-[14px] text-ink-muted leading-relaxed sm:max-w-[300px] sm:text-right">
                Every code on this wall is being drawn right now, by the same
                studio you are about to use. Scan one.
              </p>
            </div>
          </Reveal>
          <Reveal delay={100} className="mt-10">
            <QrGalleryWall />
          </Reveal>
        </div>
      </section>

      {/* ══ TYPE PICKER ═══════════════════════════════════════════════ */}
      <section id="create" className="scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[620px]">
            {/* This is a nav destination ("QR types"), so it cannot open with
                "Or" — arriving here from the menu landed you mid-sentence.

                And the count is counted. "Twenty-plus types" was the only
                hardcoded number on a page that reads every other figure from
                the code, and it had drifted into being untrue: the grid below
                offers {SELECTABLE_QR_TYPES.length}. A number typed by hand is
                a number that goes stale the next time the list changes. */}
            <h2 className="text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
              Pick what the code should do
            </h2>
            <p className="mt-4 text-[15px] sm:text-base text-ink-muted leading-relaxed">
              {SELECTABLE_QR_TYPES.length} types, each with a guided form and a
              preview of exactly what people see when they scan. Start one now —
              we’ll carry it through sign-in so nothing gets lost.
            </p>
          </div>

          <div className="mt-10">
            <QrTypeGrid onStart={handleStart} bare />
          </div>
        </div>
      </section>

      {/* ══ THE SCAN EXPERIENCE ═══════════════════════════════════════ */}
      <section className="bg-canvas border-y border-line">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5">
              <h2 className="text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
                A code is only half of it
              </h2>
              <p className="mt-5 max-w-md text-[15px] sm:text-base text-ink-muted leading-relaxed">
                Scan a contact card, a coupon or an event and a branded page
                opens — one we build and host for you. No app to install,
                nothing for your customer to type. It’s the half most QR
                generators leave you to solve yourself.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'One tap to save a contact or redeem an offer',
                  'Laid out for a phone, because that is what scans it',
                  'Change what it says without reprinting a thing',
                ].map((t) => (
                  <li
                    key={t}
                    className="flex items-start gap-3 text-[14px] text-ink-soft"
                  >
                    <span className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-primary" />
                    </span>
                    {t}
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <div className="flex flex-wrap sm:flex-nowrap justify-center gap-6 lg:gap-8">
                {/* One boundary for all three so they arrive together rather
                    than popping in one at a time, and held back until after
                    hydration.

                    The `mounted` gate is what keeps hydration clean.
                    renderToString cannot wait for a lazy chunk, so the
                    prerendered HTML contains this placeholder. If the client's
                    first render produced the cards instead, React would find a
                    boundary the server never finished, discard it and rebuild
                    it from scratch — React error #419, which is exactly what
                    this page threw before the gate was added. Rendering the
                    same placeholder on both sides means the trees match; the
                    real cards mount a frame later, still far ahead of anyone
                    scrolling this far down. */}
                {!mounted ? (
                  SCAN_DEMO_PLACEHOLDER
                ) : (
                <Suspense fallback={SCAN_DEMO_PLACEHOLDER}>
                {SCAN_DEMOS.map((d) => (
                  <figure key={d.label} className="shrink-0">
                    <ScanPreview record={d.record} />
                    <figcaption className="mt-5 text-center">
                      <span className="block text-[13px] font-semibold text-ink">
                        {d.label}
                      </span>
                      <span className="block text-[12px] text-ink-muted">
                        {d.blurb}
                      </span>
                    </figcaption>
                  </figure>
                ))}
                </Suspense>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ THE DYNAMIC PROOF ═════════════════════════════════════════ */}
      <section className="bg-canvas border-y border-line">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-20">
          <div className="max-w-[640px]">
            <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
              Dynamic codes
            </span>
            <h2 className="mt-3 text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
              Print once. Change your mind later.
            </h2>
            <p className="mt-4 text-[15px] sm:text-base text-ink-muted leading-relaxed">
              Switch the destination below and watch the pattern not move. That
              is a dynamic code: it points at a short link we host, not at your
              URL — so the sticker in your window can outlive the page it was
              printed for.
            </p>
          </div>

          <div className="mt-10">
            <DynamicSwapDemo />
          </div>

          {/* Metrics — engineered slab: texture, accent rules, big numerals */}
          <Reveal delay={60} className="mt-16">
            <div className="relative overflow-hidden rounded-2xl bg-[#0B0F1A] px-6 py-10 sm:px-10 sm:py-12">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-24 h-72 w-72 rounded-full bg-primary/25 blur-[110px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -left-16 -bottom-20 h-56 w-56 rounded-full bg-[#16C2C8]/12 blur-[110px]"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.13]"
                style={{
                  backgroundImage:
                    'radial-gradient(circle at 1px 1px, rgba(255,255,255,.5) 1px, transparent 0)',
                  backgroundSize: '30px 30px',
                }}
              />

              <div className="relative">
                {/* The flex worth making here is not the size of the numbers,
                    it is where they come from: every one is read from the
                    product at build time, so none of them can be rounded up in
                    a marketing meeting. Say that, because nobody else can. */}
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                  Counted, not claimed
                </p>
                <h3 className="mt-3 max-w-[20ch] text-[24px] sm:text-[30px] font-extrabold leading-[1.12] tracking-[-0.02em] text-white">
                  Every number here is read from the product.
                </h3>

                <div className="mt-9 grid grid-cols-2 gap-x-6 gap-y-9 sm:mt-11 sm:grid-cols-4 sm:gap-x-5">
                  {STATS.map((s) => (
                    <div key={s.label} className="relative">
                      <span
                        aria-hidden
                        className="inline-flex h-9 w-9 items-center justify-center rounded-[11px] bg-white/[0.06] text-[#9DC0FF] ring-1 ring-white/10"
                      >
                        <s.icon size={17} strokeWidth={2} />
                      </span>
                      <p className="mt-4 text-[38px] sm:text-[44px] font-extrabold leading-none tracking-[-0.04em] text-white">
                        <CountUp value={s.value} suffix={s.suffix} />
                      </p>
                      <p className="mt-2.5 text-[12px] font-bold uppercase tracking-[0.1em] text-white/55">
                        {s.label}
                      </p>
                      <p className="mt-1 text-[12px] leading-snug text-white/40">
                        {s.caption}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ FEATURES — bento ═════════════════════════════════════════ */}
      <section id="features" className="scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <Reveal>
            <div className="max-w-[560px]">
              <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                Why Liffto
              </span>
              <h2 className="mt-3 text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
                Not a generator. A place to run QR codes.
              </h2>
            </div>
          </Reveal>

          {/* Uneven grid: the lead cell carries real output, the rest are text. */}
          <Reveal delay={80}>
            <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Lead cell — spans two columns and shows the studio's range */}
              <div className="sm:col-span-2 rounded-2xl bg-surface ring-1 ring-line p-6 sm:p-8 flex flex-col sm:flex-row gap-7 items-center">
                <div className="min-w-0">
                  <div className="w-11 h-11 rounded-[14px] bg-primary/10 text-primary flex items-center justify-center">
                    <Palette size={20} />
                  </div>
                  <h3 className="mt-5 text-[19px] font-bold text-ink tracking-[-0.01em]">
                    A real design studio
                  </h3>
                  <p className="mt-2.5 text-[14px] text-ink-muted leading-relaxed">
                    {PATTERN_OPTIONS.length} body patterns, corner styles,{' '}
                    {FRAME_STYLE_COUNT} frames with your own call-to-action,
                    colours and gradients, plus a logo in the centre — with a
                    live preview of every change.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {[
                      `${PATTERN_OPTIONS.length} patterns`,
                      `${FRAME_STYLE_COUNT} frames`,
                      'Gradients',
                      'Centre logo',
                    ].map(
                      (t) => (
                        <span
                          key={t}
                          className="rounded-full bg-canvas px-2.5 py-1 text-[11px] font-semibold text-ink-soft"
                        >
                          {t}
                        </span>
                      ),
                    )}
                  </div>
                </div>
                <div className="shrink-0 rounded-2xl bg-white p-4 shadow-card ring-1 ring-black/[0.04]">
                  <LazyMount width={132} height={132}>
                    <QRView record={FEATURE_QR} size={132} />
                  </LazyMount>
                </div>
              </div>

              {/* Tall accent cell — the dynamic promise, on the dark slab */}
              <div
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between ${DARK_PANEL}`}
              >
                <div>
                  <div className="w-11 h-11 rounded-[14px] bg-white/10 text-white flex items-center justify-center">
                    <RefreshCw size={20} />
                  </div>
                  <h3 className="mt-5 text-[19px] font-bold tracking-[-0.01em]">
                    Edit it after you print
                  </h3>
                  <p className="mt-2.5 text-[14px] text-white/60 leading-relaxed">
                    Dynamic codes route through a short link you control, so a
                    printed QR can point somewhere new at any time.
                  </p>
                </div>
                <p className="mt-6 text-[13px] font-semibold text-[#6EE7E0]">
                  No reprinting. Ever.
                </p>
              </div>

              {/* Remaining features as compact cells; the last one runs the
                  full width so no cell is orphaned on its own row. */}
              {FEATURES.slice(2).map(
                ({ icon: Icon, tint, title, body }, i, arr) => (
                  <div
                    key={title}
                    className={`rounded-2xl bg-surface ring-1 ring-line p-6 transition-all duration-300 hover:ring-primary/30 hover:shadow-card ${
                      i === arr.length - 1 ? 'sm:col-span-2 lg:col-span-3' : ''
                    }`}
                  >
                    <div
                      className={`w-11 h-11 rounded-[14px] flex items-center justify-center ${tint}`}
                    >
                      <Icon size={20} />
                    </div>
                    <h3 className="mt-5 text-[17px] font-bold text-ink tracking-[-0.01em]">
                      {title}
                    </h3>
                    <p className="mt-2.5 text-[14px] text-ink-muted leading-relaxed">
                      {body}
                    </p>
                  </div>
                ),
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══════════════════════════════════════════════ */}
      <section
        id="how"
        className="bg-canvas border-y border-line scroll-mt-[72px]"
      >
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <Reveal>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
              <div className="max-w-[520px]">
                <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
                  How it works
                </span>
                <h2 className="mt-3 text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
                  Three steps, about a minute
                </h2>
              </div>
              <button
                type="button"
                onClick={goCreateFlow}
                className={`h-[52px] px-7 rounded-[10px] font-semibold inline-flex items-center justify-center gap-2.5 transition-colors shrink-0 ${DARK_BTN}`}
              >
                Start free <ArrowRight size={18} />
              </button>
            </div>
          </Reveal>

          {/* Each step shows what it actually looks like. */}
          <Reveal delay={80}>
            <div className="mt-12 grid gap-5 md:grid-cols-3">
              {STEPS.map((s, i) => (
                <div
                  key={s.title}
                  className="group relative overflow-hidden rounded-2xl bg-surface ring-1 ring-line transition-all duration-300 hover:ring-primary/30 hover:shadow-panel"
                >
                  {/* accent edge that lights up on hover */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-primary to-[#16C2C8] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                  />

                  <div className="p-7">
                    <div className="flex items-center gap-3">
                      <span className="h-8 w-8 shrink-0 rounded-full bg-primary text-white text-[13px] font-bold flex items-center justify-center tabular-nums">
                        {i + 1}
                      </span>
                      <h3 className="text-[17px] font-bold text-ink tracking-[-0.01em] leading-snug">
                        {s.title}
                      </h3>
                    </div>
                    <p className="mt-3.5 text-[14px] text-ink-muted leading-relaxed">
                      {s.body}
                    </p>
                  </div>

                  {/* Visual — a real slice of the product, on a tinted shelf */}
                  <div className="border-t border-line bg-canvas px-7 py-7 min-h-[196px] flex items-center justify-center">
                    {i === 0 && (
                      <div className="grid w-full grid-cols-3 gap-2.5">
                        {STEP_TYPES.map((t) => {
                          const Icon = t.Icon
                          return (
                            <div
                              key={t.key}
                              className="rounded-[12px] bg-surface ring-1 ring-line py-3 flex flex-col items-center gap-1.5 shadow-sm"
                            >
                              <span
                                className={`w-8 h-8 rounded-[10px] flex items-center justify-center ${t.tint}`}
                              >
                                <Icon size={15} />
                              </span>
                              <span className="text-[9.5px] font-bold uppercase tracking-wide text-ink-muted">
                                {t.label.split(' ')[0]}
                              </span>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {i === 1 && <StepStyleDemo />}

                    {i === 2 && (
                      <div className="w-full space-y-2.5">
                        {/* a row lifted from the dashboard */}
                        <div className="flex items-center gap-3 rounded-[12px] bg-surface ring-1 ring-line p-3 shadow-sm">
                          <span className="rounded-[8px] bg-white p-1 ring-1 ring-line">
                            <LazyMount width={30} height={30}>
                              <QRView record={FEATURE_QR} size={30} />
                            </LazyMount>
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-[11px] font-bold text-ink truncate">
                              Summer menu
                            </span>
                            <span className="block text-[10px] text-primary truncate">
                              liffto.com/aX7f2b
                            </span>
                          </span>
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-bold text-success">
                            <span className="h-1.5 w-1.5 rounded-full bg-success" />
                            Active
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {['PNG', 'JPEG', 'SVG', 'WEBP'].map((f) => (
                            <div
                              key={f}
                              className="rounded-[10px] bg-surface ring-1 ring-line py-2 text-center text-[10px] font-bold text-ink-soft"
                            >
                              {f}
                            </div>
                          ))}
                        </div>
                        <div className="rounded-[10px] bg-primary py-2 text-center text-[11px] font-bold text-white shadow-sm shadow-primary/25">
                          2048px print-ready
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ WHERE WE'RE FROM ══════════════════════════════════════════ */}
      {/* Deliberately the section before pricing. "Everything is free" raises
          the question of who is behind it and what they want, and the honest
          answer — a registered company in Tamil Nadu, with numbers anyone can
          look up — is worth more read immediately before that claim than
          anywhere else on the page. */}
      <Recognitions />

      {/* ══ PRICING ═══════════════════════════════════════════════════ */}
      <section id="pricing" className="scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="rounded-2xl bg-canvas border border-line overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  Pricing
                </span>
                {/* "Everything is free" invites the obvious next thought —
                    so what's the catch — and then leaves it hanging. Name the
                    catch people are actually braced for (ads, a watermark, your
                    codes as leverage) and say it isn't there. */}
                <h2 className="mt-3 text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
                  There is no paid plan
                </h2>
                <p className="mt-4 max-w-sm text-[15px] text-ink-muted leading-relaxed">
                  Not a free tier — the whole product. No trial to run out, no
                  feature held back, nothing to upgrade to. We don’t sell ads,
                  and we don’t put our name on your code.
                </p>
                <div className="mt-8 flex items-end gap-3">
                  <span className="text-[56px] leading-none font-extrabold tracking-[-0.03em] text-ink">
                    ₹0
                  </span>
                  <span className="text-[13px] text-ink-muted mb-2">
                    forever
                  </span>
                </div>
              </div>

              <div className="bg-surface border-t lg:border-t-0 lg:border-l border-line p-8 sm:p-12">
                <ul className="space-y-4">
                  {[
                    'Unlimited QR codes',
                    'Dynamic & static codes',
                    'Custom branding, logos & frames',
                    // Not "Scan tracking" — that word promises a breakdown by
                    // time, place and device, and the FAQ two sections down
                    // correctly says no such thing is recorded. A count is
                    // what this is, so a count is what it should be called.
                    'Live scan counts',
                    'All download formats',
                    'Saved design templates',
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-3 text-[14px] text-ink-soft"
                    >
                      <span className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                        <Check size={12} className="text-success" />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={goCreateFlow}
                  className="mt-8 w-full h-[52px] rounded-[10px] bg-primary text-white font-semibold hover:bg-primary-600 transition-colors shadow-sm shadow-primary/25"
                >
                  Create your first code
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ FAQ ═══════════════════════════════════════════════════════ */}
      <section
        id="faq"
        className="bg-canvas border-y border-line scroll-mt-[72px]"
      >
        <div className="max-w-[860px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <h2 className="text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
            The questions we get most
          </h2>
          <div className="mt-10 divide-y divide-line border-y border-line">
            {FAQS.map((f) => (
              <FaqRow key={f.q} {...f} />
            ))}
          </div>
          <p className="mt-8 text-[14px] text-ink-muted">
            Still stuck?{' '}
            <a
              href="mailto:support@liffto.com"
              className="font-semibold text-primary hover:underline"
            >
              support@liffto.com
            </a>
          </p>
        </div>
      </section>

      {/* ══ FINAL CTA ═════════════════════════════════════════════════ */}
      <section className="px-5 sm:px-8 py-16 sm:py-24">
        <div
          className={`max-w-[1200px] mx-auto rounded-2xl px-8 py-14 sm:px-14 sm:py-20 ${DARK_PANEL}`}
        >
          <div className="grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-8">
              <h2 className="text-[32px] sm:text-[44px] leading-[1.04] font-extrabold tracking-[-0.03em] text-white">
                Your first code takes about a minute
              </h2>
              <p className="mt-4 max-w-md text-[15px] text-white/60 leading-relaxed">
                No card. No trial. Nothing to upgrade to later. Start with a
                static code and you don’t even need an account.
              </p>
            </div>
            <div className="lg:col-span-4 flex lg:justify-end">
              <button
                type="button"
                onClick={goCreateFlow}
                className="h-[52px] px-7 rounded-[10px] bg-white text-[#1F2430] font-bold inline-flex items-center gap-2.5 hover:bg-white/90 transition-colors"
              >
                Create a QR code <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      </main>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="border-t border-line">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="max-w-xs">
              <Logo />
              <p className="mt-4 text-[13px] text-ink-muted leading-relaxed">
                Branded QR codes you can change after they’re printed. Free,
                with no watermark and no account needed to start.
              </p>
            </div>
            <div className="flex gap-12 sm:gap-20">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                  Product
                </p>
                <ul className="mt-4 space-y-2.5">
                  {NAV_LINKS.map((l) => (
                    <li key={l.href}>
                      <a
                        href={l.href}
                        className="text-[13px] text-ink-soft hover:text-primary transition-colors"
                      >
                        {l.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-ink-faint">
                  Get started
                </p>
                <ul className="mt-4 space-y-2.5">
                  <li>
                    <button
                      type="button"
                      onClick={goCreateFlow}
                      className="text-[13px] text-ink-soft hover:text-primary transition-colors"
                    >
                      Create a QR code
                    </button>
                  </li>
                  <li>
                    <button
                      type="button"
                      onClick={() => openLogin()}
                      className="text-[13px] text-ink-soft hover:text-primary transition-colors"
                    >
                      Log in
                    </button>
                  </li>
                  <li>
                    <a
                      href="mailto:support@liffto.com"
                      className="text-[13px] text-ink-soft hover:text-primary transition-colors"
                    >
                      Contact support
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-12 pt-6 border-t border-line flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] text-ink-faint">
              © {new Date().getFullYear()} Liffto. All rights reserved. · Made
              in {HOME_REGION}
            </p>
            <div className="flex items-center gap-5 text-[12px] text-ink-faint">
              <a
                href="/terms"
                className="hover:text-ink-soft transition-colors"
              >
                Terms of Service
              </a>
              <a
                href="/privacy"
                className="hover:text-ink-soft transition-colors"
              >
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
