import { Sparkles } from 'lucide-react'

/**
 * The "Must try" badge.
 *
 * One definition, because the pulse is the part that does the work and the
 * part nobody remembers to re-type. A second hand-copied chip would look right
 * on the day and be a still, unnoticed badge a release later.
 *
 * Solid primary with white text — 5.53:1, so it still reads at 10px. The pulse
 * (see .must-try-badge in index.css) is what makes it findable: a still badge
 * on a still card is just one more object on the page, and this has to be
 * noticed by someone who does not yet know the thing behind it exists. It is
 * bounded by what it points at — show it only while that thing is untried, so
 * it stops the moment someone does what it asks.
 */
export default function MustTryBadge({ className = '' }) {
  return (
    <span
      className={`must-try-badge inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white ${className}`}
    >
      <Sparkles size={11} className="must-try-spark" aria-hidden="true" /> Must try
    </span>
  )
}
