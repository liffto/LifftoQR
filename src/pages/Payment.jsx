import { Check, Sparkles, Infinity as InfinityIcon } from 'lucide-react'
import Layout from '../components/Layout'

// One account type, everything on. Listed as capabilities rather than tiers so
// there is nothing here to compare, upgrade to, or be upsold into.
const INCLUDED = [
  'Unlimited QR codes',
  'Dynamic & static QR codes',
  'Custom branding, logos & frames',
  'Saved design templates',
  'All download formats — PNG, SVG, JPG & more',
  'Analytics & real-time scan tracking',
  'Editable destinations after printing',
  'Contact cards with one-tap save',
  'Bulk creation',
  'API access',
  'White-label QR codes',
  'Priority support',
]

export default function Payment() {
  return (
    <Layout breadcrumb="Subscription">
      {/* Everything-included banner */}
      <div className="relative overflow-hidden rounded-[10px] mb-6 bg-gradient-to-r from-[#1B59F5] via-[#2563eb] to-[#7c3aed] p-6 sm:p-8 text-white shadow-lg">
        <div className="absolute -top-8 -right-8 h-40 w-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-24 h-28 w-28 rounded-full bg-white/5" />

        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur">
            <Sparkles size={12} className="shrink-0" />
            Every feature unlocked
          </div>

          <h2 className="text-2xl font-extrabold leading-tight sm:text-3xl">
            Liffto is free
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/80">
            There are no plans to compare and nothing to upgrade. Every feature
            below is already active on your account — no limits, no credit card.
          </p>
        </div>
      </div>

      {/* What you get */}
      <div className="rounded-[10px] bg-surface p-6 shadow-card sm:p-7">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-primary/10 text-primary">
            <InfinityIcon size={19} />
          </div>
          <div>
            <h3 className="text-base font-bold text-ink">What you get</h3>
            <p className="mt-0.5 text-xs text-ink-muted">
              Included on every account
            </p>
          </div>
        </div>

        <ul className="grid grid-cols-1 gap-x-8 gap-y-3.5 sm:grid-cols-2">
          {INCLUDED.map((f) => (
            <li key={f} className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full bg-success/10">
                <Check size={11} className="text-success" strokeWidth={3} />
              </span>
              <span className="text-sm leading-snug text-ink-soft">{f}</span>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  )
}
