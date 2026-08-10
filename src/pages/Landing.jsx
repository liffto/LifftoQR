import { useEffect, useState } from 'react'
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
} from 'lucide-react'
import { defaultDesign } from '../lib/store'
import { useLoginModal } from '../context/LoginModalContext'
import { LOGO_OPTIONS } from '../lib/qr'
import { startDraft } from '../lib/qrDraft'
import { getTheme, toggleTheme } from '../lib/theme'
import { findType } from '../lib/qrTypes'
import { useAuth } from '../context/AuthContext'
import Logo from '../components/Logo'
import { QrTypeGrid } from '../components/QrQuickStart'
import HeroQrStudio from '../components/HeroQrStudio'
import DynamicSwapDemo from '../components/DynamicSwapDemo'
import QrGalleryWall from '../components/QrGalleryWall'
import StepStyleDemo from '../components/StepStyleDemo'
import QRView from '../components/QRView'
import ScanPreview from '../components/ScanPreview'
import Reveal from '../components/Reveal'

const NAV_LINKS = [
  { label: 'QR types', href: '#create' },
  { label: 'Features', href: '#features' },
  { label: 'How it works', href: '#how' },
  { label: 'Pricing', href: '#pricing' },
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
        firstName: 'Kavuthamraj',
        lastName: 'GS',
        org: 'Liffto',
        title: 'Product & Design',
        phone: '+91 98400 00000',
        email: 'hello@liffto.com',
        url: 'https://liffto.com',
        city: 'Chennai',
        country: 'India',
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
        details: 'Valid once per customer, in store or online.',
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

// A handful of real types for the step-one visual.
const STEP_TYPES = ['url', 'wifi', 'vcard', 'whatsapp', 'coupon', 'pdf'].map(
  (k) => findType(k),
)

// Product facts, not invented usage numbers.
const STATS = [
  { value: '20+', label: 'QR code types' },
  { value: '7', label: 'Frame styles' },
  { value: '4', label: 'Export formats' },
  { value: '2048px', label: 'Print resolution' },
]

const FEATURES = [
  {
    icon: Palette,
    tint: 'bg-primary/10 text-primary',
    title: 'A real design studio',
    body: 'Six body patterns, corner styles, seven frames with your own call-to-action, colours and gradients, plus a logo in the centre — with a live preview of every change.',
  },
  {
    icon: RefreshCw,
    tint: 'bg-violet-50 text-violet-500',
    title: 'Edit it after you print',
    body: 'Dynamic codes route through a short link you control, so a printed QR can point somewhere new at any time. No reprinting, no new sticker.',
  },
  {
    icon: BarChart2,
    tint: 'bg-success/10 text-success',
    title: 'See what gets scanned',
    body: 'Track scans per code from one dashboard, and switch any dynamic code Active or Inactive the moment a campaign ends.',
  },
  {
    icon: LayoutGrid,
    tint: 'bg-amber-50 text-amber-500',
    title: 'Twenty-plus types',
    body: 'Links, Wi-Fi, contact cards, WhatsApp, menus and PDFs, coupons, events, locations, app stores and a link tree — each with a guided form.',
  },
  {
    icon: Download,
    tint: 'bg-rose-50 text-rose-500',
    title: 'Print-ready exports',
    body: 'High-resolution PNG, JPEG and WEBP, or SVG vector that stays razor sharp from business card to billboard.',
  },
  {
    icon: BookmarkPlus,
    tint: 'bg-teal-50 text-teal-600',
    title: 'Templates & organisation',
    body: 'Save a look as a template to reuse across codes, then search, filter and manage everything from a card or table view.',
  },
]

const STEPS = [
  {
    title: 'Pick a type, add your content',
    body: 'Start with a link right here, or choose from twenty-plus types. Each one has a guided form and shows what people see when they scan.',
  },
  {
    title: 'Make it yours',
    body: 'Drop in your logo, pick colours, a pattern and a frame with a call-to-action. The preview updates as you go.',
  },
  {
    title: 'Download and manage',
    body: 'Export print-ready files, then track scans and change where dynamic codes point — all from your dashboard.',
  },
]

const FAQS = [
  {
    q: 'What is the difference between a dynamic and a static QR code?',
    a: 'A static code has the destination baked into the pattern — once printed it can never change. A dynamic code encodes a short link we host, so you can update where it points, track scans, and switch it on or off at any time without reprinting.',
  },
  {
    q: 'Do I need an account to create a QR code?',
    a: 'You can start right on this page — pick a type and enter your content. We ask you to sign in with Google when you continue, so your codes are saved to your account and your dynamic codes stay editable.',
  },
  {
    q: 'Will my QR codes keep working?',
    a: 'Static codes work forever because the data lives in the image. Dynamic codes stay live as long as your account is active — and you keep control of where they point.',
  },
  {
    q: 'Can I put my own logo and colours on a code?',
    a: 'Yes. Add a logo in the centre, set body and corner colours or a gradient, choose from six body patterns and seven frames, then save the result as a template to reuse.',
  },
  {
    q: 'What does it cost?',
    a: 'Every feature is free while we are in our launch phase — no credit card required. When pricing is introduced, early users receive founder discounts.',
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
  const [theme, setThemeVal] = useState(getTheme)

  const onToggleTheme = () => {
    toggleTheme()
    setThemeVal(getTheme())
  }

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

  const handleStart = (
    typeKey,
    content,
    dynamicPref,
    target,
    designOverride,
  ) => {
    startDraft(typeKey, content, dynamicPref, designOverride)
    requireAuth(target)
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

  return (
    <div className="min-h-screen bg-surface">
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
            <Logo variant="create" white={!solidNav} />
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
              className={`w-9 h-9 rounded-[10px] flex items-center justify-center transition-colors ${
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
              Go to dashboard
            </button>
          </div>
        </div>
      </header>

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
                  Free during launch — every feature unlocked
                </span>

                <h1 className="mt-7 text-[36px] leading-[1.05] sm:text-[48px] lg:text-[56px] lg:leading-[1.03] font-extrabold tracking-[-0.035em] text-white">
                  Branded QR codes
                  <br />
                  you can{' '}
                  <span className="bg-gradient-to-r from-[#7BA8FF] via-[#6EE7E0] to-[#7BA8FF] bg-clip-text text-transparent">
                    edit after
                  </span>
                  <br />
                  you print
                </h1>

                <p className="mt-7 max-w-md text-[16px] sm:text-[17px] text-white/60 leading-relaxed">
                  Design codes that match your brand, point them anywhere, and
                  track every scan — for links, Wi-Fi, contact cards, menus and
                  sixteen more types.
                </p>

                {/* Every one of these is verifiable in the codebase: no ad or
                    tracker scripts ship, and nothing is stamped onto the
                    downloaded code. */}
                <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2.5 text-[13px] text-white/55">
                  {[
                    'No ads',
                    'No watermark',
                    'No credit card',
                    'Print-ready files',
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
                <h2 className="mt-3 text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
                  One engine, endless looks
                </h2>
              </div>
              <p className="text-[14px] text-ink-muted leading-relaxed sm:max-w-[300px] sm:text-right">
                Every code below is real, rendered right now — patterns,
                corners, gradients and logos, all yours to change.
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
            <h2 className="text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
              Or choose a QR code type
            </h2>
            <p className="mt-4 text-[15px] sm:text-base text-ink-muted leading-relaxed">
              Twenty-plus types, each with a guided form and a preview of what
              people see when they scan. We’ll carry your work through sign-in
              so nothing gets lost.
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
                For contact cards, coupons, events and more, scanning opens a
                branded page we build for you — no app to install, nothing for
                your customer to type. It’s the part most QR generators skip.
              </p>
              <ul className="mt-7 space-y-3">
                {[
                  'One tap to save a contact or redeem an offer',
                  'Looks designed on every phone',
                  'Change what it says without reprinting',
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
              Try it — switch the destination and watch the code stay exactly
              the same. That is a dynamic QR: the pattern points at a short link
              we host, so the sticker on your window never goes out of date.
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
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/40">
                  What you get, precisely
                </p>

                <div className="mt-8 grid grid-cols-2 gap-y-10 sm:grid-cols-4">
                  {STATS.map((s) => (
                    <div
                      key={s.label}
                      className="relative sm:px-8 sm:first:pl-0"
                    >
                      {/* accent rule instead of a plain divider */}
                      <span
                        aria-hidden
                        className="block h-[3px] w-9 rounded-full bg-gradient-to-r from-[#7BA8FF] to-[#6EE7E0]"
                      />
                      <p className="mt-5 text-[40px] sm:text-[46px] font-extrabold leading-none tracking-[-0.04em] text-white tabular-nums">
                        {s.value}
                      </p>
                      <p className="mt-3 text-[12px] font-semibold uppercase tracking-[0.12em] text-white/45">
                        {s.label}
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
                    Six body patterns, corner styles, seven frames with your own
                    call-to-action, colours and gradients, plus a logo in the
                    centre — with a live preview of every change.
                  </p>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {['6 patterns', '7 frames', 'Gradients', 'Centre logo'].map(
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
                  <QRView record={FEATURE_QR} size={132} />
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
                Start now <ArrowRight size={18} />
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
                            <QRView record={FEATURE_QR} size={30} />
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

      {/* ══ PRICING ═══════════════════════════════════════════════════ */}
      <section id="pricing" className="scroll-mt-[72px]">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-16 sm:py-24">
          <div className="rounded-2xl bg-canvas border border-line overflow-hidden">
            <div className="grid lg:grid-cols-2">
              <div className="p-8 sm:p-12">
                <span className="text-[11px] font-bold uppercase tracking-[0.14em] text-primary">
                  Launch offer
                </span>
                <h2 className="mt-3 text-[26px] sm:text-[32px] leading-[1.12] font-extrabold tracking-[-0.02em] text-ink">
                  Everything is free right now
                </h2>
                <p className="mt-4 max-w-sm text-[15px] text-ink-muted leading-relaxed">
                  We’re in our launch phase, so every Pro and Enterprise feature
                  is unlocked at no cost. No credit card. Early users receive
                  founder discounts when pricing arrives.
                </p>
                <div className="mt-8 flex items-end gap-3">
                  <span className="text-ink-faint line-through text-xl font-bold">
                    $49
                  </span>
                  <span className="text-[56px] leading-none font-extrabold tracking-[-0.03em] text-ink">
                    $0
                  </span>
                  <span className="text-[13px] text-ink-muted mb-2">
                    / month
                  </span>
                </div>
              </div>

              <div className="bg-surface border-t lg:border-t-0 lg:border-l border-line p-8 sm:p-12">
                <ul className="space-y-4">
                  {[
                    'Unlimited QR codes',
                    'Dynamic & static codes',
                    'Custom branding, logos & frames',
                    'Scan tracking',
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
                  Get started free
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
            Questions? We’ll answer them here
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
                Make your first QR code in about a minute
              </h2>
              <p className="mt-4 max-w-md text-[15px] text-white/60 leading-relaxed">
                No credit card, no trial timer. Everything is unlocked while
                we’re in launch.
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

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer className="border-t border-line">
        <div className="max-w-[1200px] mx-auto px-5 sm:px-8 py-12">
          <div className="flex flex-col gap-10 sm:flex-row sm:justify-between">
            <div className="max-w-xs">
              <Logo variant="create" />
              <p className="mt-4 text-[13px] text-ink-muted leading-relaxed">
                Design, publish and manage branded QR codes — dynamic or static
                — from one place.
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
              © {new Date().getFullYear()} Liffto. All rights reserved.
            </p>
            <div className="flex items-center gap-5 text-[12px] text-ink-faint">
              <a className="hover:text-ink-soft cursor-pointer transition-colors">
                Terms of Service
              </a>
              <a className="hover:text-ink-soft cursor-pointer transition-colors">
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
