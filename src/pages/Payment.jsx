import { Check, Zap, Shield, Star, Sparkles, Gift, Rocket } from 'lucide-react'
import Layout from '../components/Layout'

const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Great for getting started',
    icon: Zap,
    iconColor: 'text-ink-muted',
    features: [
      '5 QR codes',
      'Static QR only',
      'Basic designs',
      'PNG download',
      'Community support',
    ],
    cta: 'Current Plan',
    current: true,
    disabled: true,
  },
  {
    name: 'Pro',
    price: '$12',
    period: 'per month',
    description: 'For growing businesses',
    icon: Shield,
    iconColor: 'text-primary',
    features: [
      'Unlimited QR codes',
      'Dynamic & Static QR',
      'Custom branding',
      'All download formats',
      'Analytics & scans',
      'Priority support',
    ],
    cta: 'Upgrade to Pro',
    highlight: true,
  },
  {
    name: 'Enterprise',
    price: '$49',
    period: 'per month',
    description: 'For teams and agencies',
    icon: Star,
    iconColor: 'text-amber-500',
    features: [
      'Everything in Pro',
      'Team collaboration',
      'White-label QR',
      'API access',
      'Bulk creation',
      'Dedicated support',
    ],
    cta: 'Contact Sales',
  },
]

export default function Payment() {
  return (
    <Layout breadcrumb="Subscription">
      {/* LAUNCH OFFER BANNER */}
      <div className="relative overflow-hidden rounded-[10px] mb-6 bg-gradient-to-r from-[#1B59F5] via-[#2563eb] to-[#7c3aed] p-5 sm:p-6 text-white shadow-lg">
        {/* Background decoration circles */}
        <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute -bottom-10 right-24 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute top-4 right-64 w-10 h-10 rounded-full bg-white/10" />

        <div className="relative flex flex-col lg:flex-row lg:items-start lg:justify-between gap-5 lg:gap-6">
          <div className="flex-1 min-w-0">
            {/* Badge */}
            <div className="inline-flex items-center gap-1.5 bg-white/15 backdrop-blur rounded-full px-3 py-1 text-xs font-semibold mb-3 border border-white/20">
              <Rocket size={12} className="shrink-0" />
              LAUNCH OFFER — Limited Time
            </div>

            <h2 className="text-xl sm:text-2xl font-extrabold leading-tight mb-2">
              Everything is FREE right now. 🎉
            </h2>
            <p className="text-white/80 text-sm leading-relaxed max-w-xl">
              Use{' '}
              <span className="text-white font-semibold">
                Pro & Enterprise features
              </span>{' '}
              at absolutely zero cost while we're in our launch phase. No credit
              card. No catch.
            </p>

            <div className="flex flex-wrap gap-3 mt-4">
              {[
                'Unlimited QR Codes',
                'Dynamic QR',
                'Custom Branding',
                'Analytics',
                'API Access',
              ].map((f) => (
                <span
                  key={f}
                  className="inline-flex items-center gap-1.5 bg-white/15 border border-white/20 rounded-full px-3 py-1 text-xs font-medium"
                >
                  <Gift size={11} />
                  {f}
                </span>
              ))}
            </div>
          </div>

          {/* Right side price callout */}
          <div className="w-full lg:w-auto shrink-0 text-center bg-white/10 border border-white/20 rounded-[10px] px-6 py-4 backdrop-blur">
            <div className="flex items-end justify-center gap-1 mb-1">
              <span className="text-white/50 line-through text-lg font-bold">
                $49
              </span>
              <span className="text-4xl font-extrabold text-white">$0</span>
            </div>
            <p className="text-white/70 text-xs">per month, right now</p>
            <div className="mt-3 bg-white text-primary text-xs font-bold px-4 py-2 rounded-[10px]">
              ✦ All plans unlocked
            </div>
          </div>
        </div>

        {/* Bottom disclaimer */}
        <p className="relative mt-4 text-white/50 text-xs border-t border-white/10 pt-3">
          Pricing will be introduced once we reach our growth milestone. Early
          users will receive special founder discounts.
        </p>
      </div>

      {/* Current plan banner */}
      <div className="bg-white rounded-[10px] shadow-card p-5 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-[10px] bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles size={18} className="text-primary" />
          </div>
          <div>
            <p className="text-xs text-ink-muted mb-0.5">Your Current Plan</p>
            <p className="font-bold text-ink text-base">
              Free — Everything Unlocked
            </p>
            <p className="text-xs text-success mt-0.5 font-medium">
              All Pro & Enterprise features are free during our launch phase
            </p>
          </div>
        </div>
        <div className="shrink-0">
          <span className="inline-flex items-center gap-1.5 bg-success/10 text-success text-xs font-semibold px-3 py-1.5 rounded-full border border-success/20">
            <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
            No billing · Free forever
          </span>
        </div>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          return (
            <div
              key={plan.name}
              className={`bg-white rounded-[10px] shadow-card p-6 flex flex-col relative ${
                plan.highlight ? 'ring-2 ring-primary' : ''
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div
                className={`w-10 h-10 rounded-[10px] flex items-center justify-center mb-4 ${plan.highlight ? 'bg-primary/10' : 'bg-canvas'}`}
              >
                <Icon size={20} className={plan.iconColor} />
              </div>
              <h3 className="font-semibold text-ink text-base">{plan.name}</h3>
              <p className="text-xs text-ink-muted mt-0.5 mb-4">
                {plan.description}
              </p>
              <div className="mb-6">
                <span className="text-3xl font-bold text-ink">
                  {plan.price}
                </span>
                <span className="text-sm text-ink-muted ml-1">
                  /{plan.period}
                </span>
              </div>
              <ul className="space-y-2.5 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className="flex items-center gap-2 text-sm text-ink-soft"
                  >
                    <Check size={15} className="text-success shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <button
                type="button"
                disabled={plan.disabled}
                className={`w-full h-11 rounded-[10px] text-sm font-semibold transition-colors ${
                  plan.disabled
                    ? 'bg-canvas text-ink-muted cursor-default border border-line'
                    : plan.highlight
                      ? 'bg-primary text-white hover:bg-primary-600'
                      : 'border border-primary text-primary hover:bg-primary/5'
                }`}
              >
                {plan.cta}
              </button>
            </div>
          )
        })}
      </div>

      {/* Billing history */}
      <div className="bg-white rounded-[10px] shadow-card p-5 mt-6">
        <h3 className="font-semibold text-ink mb-4">Billing History</h3>
        <div className="text-center py-10 text-sm text-ink-muted">
          No billing history yet. Upgrade to a paid plan to see invoices here.
        </div>
      </div>
    </Layout>
  )
}
