import { Plug, Mail } from 'lucide-react'
import Layout from '../components/Layout'

const SUPPORT_EMAIL = 'support@liffto.com'

/**
 * Integrations — none of which exist yet, which is what this page now says.
 *
 * It used to be a mockup dressed as a working feature. It displayed an "API
 * Key" and a "Secret Key" — `ak_live_liffto_…3F9A` and `sk_live_…` — behind a
 * copy button, as though they were the account's own credentials. They were
 * string literals. There is no API key issued anywhere in this codebase and no
 * public endpoint to use one against, so anyone who copied them was carrying
 * away a fake credential for an API that does not exist.
 *
 * Everything else was the same shape: Regenerate had no handler, API Docs
 * pointed at "#", Save Webhook had no handler, and Connect Platforms listed
 * Zapier, Slack, Google Sheets, HubSpot and Mailchimp with toggles that flipped
 * a local flag and connected nothing.
 *
 * The route and its nav entry stay, because removing them is a product
 * decision rather than a correctness one, and a page that says "not yet" is
 * more use than a dead link.
 */
export default function Integration() {
  return (
    <Layout breadcrumb="Integration">
      <div className="mx-auto max-w-2xl">
        <div className="rounded-[10px] bg-white p-6 shadow-card sm:p-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-primary/10 text-primary">
            <Plug size={22} />
          </div>

          <h2 className="mt-5 text-lg font-bold text-ink">
            Integrations aren&apos;t available yet
          </h2>

          <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-ink-muted">
            There is no public API, no API keys to issue, and no webhooks or
            third-party connections you can set up today. Everything is done
            from the dashboard: create a code, design it, download it, and watch
            its scans there.
          </p>

          <p className="mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
            This page used to show a key and a set of connect buttons. None of
            them did anything, so they have been taken out rather than left
            looking real.
          </p>

          <div className="mt-6 rounded-[10px] border border-line bg-canvas p-4">
            <p className="text-sm font-medium text-ink">
              Need one of these?
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-muted">
              Tell us which integration would actually help and what you would
              do with it — that is what decides the order these get built in.
            </p>
            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent('Integration request')}`}
              className="mt-3 inline-flex h-9 items-center gap-2 rounded-[10px] bg-primary px-4 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <Mail size={15} /> Email {SUPPORT_EMAIL}
            </a>
          </div>
        </div>
      </div>
    </Layout>
  )
}
