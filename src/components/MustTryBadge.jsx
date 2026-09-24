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
 *
 * `compact` is for a tile too small to carry a chip — a two-word chip needs
 * about 70px, which a panel heading has and a type tile in a two-column grid
 * does not. It is the spark alone, with no box: shrinking the chip to a filled
 * 18px circle instead produced the unread dot, which reads as something to
 * clear rather than something to try. The tile behind it carries the highlight
 * (see QrTypeGrid), which is the half that is visible from across a grid.
 *
 * Amber rather than the primary, because in this grid the primary is already a
 * category — it is the tint on the URL and Wi-Fi tiles — and a colour cannot say
 * "Wi-Fi" and "recommended" in the same view. Amber says neither, which is what
 * lets it mean this. amber-600/amber-300 is the pair used for warm glyphs
 * elsewhere here, and clears the 3:1 a glyph needs in both themes (a flatter
 * amber-500 is 2.15:1 on white, which is why it isn't that).
 *
 * The word survives as the tooltip and the accessible name, so nothing that
 * reads this page by pointer or by screen reader loses it.
 */
export default function MustTryBadge({ compact = false, className = '' }) {
  if (compact) {
    return (
      <span
        title="Must try"
        className={`inline-flex shrink-0 items-center text-amber-600 dark:text-amber-300 ${className}`}
      >
        <Sparkles
          size={13}
          strokeWidth={2.4}
          className="must-try-twinkle"
          aria-hidden="true"
        />
        <span className="sr-only">Must try</span>
      </span>
    )
  }

  return (
    <span
      className={`must-try-badge inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.06em] text-white ${className}`}
    >
      <Sparkles size={11} className="must-try-spark" aria-hidden="true" /> Must try
    </span>
  )
}
