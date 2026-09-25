import { BadgeCheck, MapPin, ExternalLink } from 'lucide-react'
import {
  RECOGNITIONS,
  hasVerifiableNumber,
  HOME_REGION,
} from '../lib/recognitions'

/**
 * Where this was built, and who it is registered with.
 *
 * The job is trust, and the thing that earns it is not the badges — a logo
 * strip is a row of pictures, and every one of them can be saved by anyone and
 * put on any page. What cannot be faked is a registration number, because the
 * department that issued it publishes a lookup. So the number is the object
 * here and each card sends the visitor to the issuer's own portal to check it,
 * rather than to a certificate we host and could have made.
 *
 * That is also the voice the rest of this page already uses: the metrics slab
 * says "counted, not claimed" because every figure on it is read from the
 * product. This is the same promise pointed at the company instead.
 *
 * Entries with no number yet still render — the recognition is real whether or
 * not the certificate is to hand — they simply show no proof line, and the
 * invitation to go and check is withheld until there is something to check.
 */
export default function Recognitions() {
  if (RECOGNITIONS.length === 0) return null

  return (
    <section
      id="about"
      className="scroll-mt-[72px] border-y border-line bg-canvas"
    >
      <div className="mx-auto max-w-[1200px] px-5 py-16 sm:px-8 sm:py-20">
        <div className="max-w-[640px]">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            <MapPin size={12} aria-hidden="true" />
            Where we&apos;re from
          </span>
          <h2 className="mt-3 text-[26px] font-extrabold leading-[1.12] tracking-[-0.02em] text-ink sm:text-[32px]">
            Built in {HOME_REGION.split(',')[0]}, registered in India
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-ink-muted sm:text-base">
            Liffto is made by a small team in {HOME_REGION}.
            {hasVerifiableNumber
              ? ' Each registration below carries its number, and each link goes to the department that issued it — a badge is a picture anyone can copy, a registration number is something you can look up.'
              : ' These are the departments we are registered with, and each link goes to the issuing portal rather than to a certificate we host.'}
          </p>
        </div>

        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {RECOGNITIONS.map((r) => (
            <li
              key={r.key}
              className="flex flex-col rounded-2xl bg-surface p-6 ring-1 ring-line transition-all duration-300 hover:shadow-card hover:ring-primary/30"
            >
              {/* The issuing body's own mark, on a white plaque in both
                  themes. These are government marks: their colours are part of
                  what makes them that mark, so the usual dark-mode tricks are
                  out — `dark:invert` would turn the Indian tricolour in the
                  Startup India swoosh into its opposite, and StartupTN's navy
                  wordmark would go pale. Giving the logo its own white ground
                  is what print does with a partner lockup, and it keeps every
                  mark exactly as its owner published it. */}
              {r.image ? (
                // Fixed plaque, variable logo. These marks do not share an
                // aspect ratio — two are wide wordmarks, the MSME one is a
                // stacked near-square — and sizing them all to one height
                // would either shrink that one to an unreadable 35px or blow
                // the wordmarks across the card. The plaque is the constant so
                // the three cards line up; what sits inside it is per-mark.
                <span className="mb-5 inline-flex h-[64px] w-fit items-center rounded-[10px] bg-white px-3.5 ring-1 ring-black/[0.06]">
                  <img
                    src={r.image}
                    alt={r.name}
                    className={`${r.imageClass || 'h-7'} w-auto object-contain`}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
              ) : (
                // Same plaque, set in our own typeface, so a card without a
                // mark still lines up with the ones that have one. Plain text
                // on purpose: anything styled to resemble a ministry's mark
                // would be a drawn emblem by another name.
                <span className="mb-5 inline-flex h-[64px] w-fit items-center rounded-[10px] bg-white px-4 ring-1 ring-black/[0.06]">
                  <span className="text-[15px] font-extrabold tracking-[-0.01em] text-[#1F2430]">
                    {r.name}
                  </span>
                </span>
              )}

              <div className="flex items-start gap-2.5">
                <BadgeCheck
                  size={18}
                  className="mt-0.5 shrink-0 text-primary"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  {/* The name is already on the plaque above, so repeating it
                      here would be a caption on a caption. The heading is the
                      issuing department instead — which is the part a reader
                      checking us out actually wants. */}
                  <h3 className="text-[15px] font-semibold text-ink-soft">
                    {r.issuer}
                  </h3>
                </div>
              </div>

              {r.number && (
                <div className="mt-4">
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-ink-faint">
                    {r.numberLabel}
                  </p>
                  {/* Selectable and monospaced, because the useful thing to do
                      with a registration number is copy it into the portal. */}
                  <p className="mt-1 select-all break-all font-mono text-[13px] font-semibold text-ink-soft">
                    {r.number}
                  </p>
                </div>
              )}

              <a
                href={r.verifyUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto inline-flex items-center gap-1.5 pt-5 text-[13px] font-semibold text-primary hover:underline"
              >
                {r.number ? 'Check it yourself' : 'Visit the portal'}
                <ExternalLink size={13} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
