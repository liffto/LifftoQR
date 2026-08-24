import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import Logo from '../components/Logo'

// Terms and Privacy, sharing one shell.
//
// These exist because the sign-in dialog asks people to agree to them, and
// until now both links were <a> tags with no href — agreement to a document
// nobody could open. The wording below describes what the app actually does
// today rather than boilerplate: Google is the only sign-in, deleting an
// account is a support request because the in-app button does not yet delete
// anything, and there is no payment path to describe.

const SUPPORT = 'support@liffto.com'

function LegalShell({ title, updated, children }) {
  const navigate = useNavigate()

  useEffect(() => {
    document.title = `${title} — Liffto`
    return () => {
      document.title = 'LIFFTO — Create QR'
    }
  }, [title])

  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-20 flex h-[68px] items-center gap-3 border-b border-line bg-surface px-4 sm:gap-5 sm:px-6">
        <button type="button" onClick={() => navigate('/')} aria-label="Liffto">
          <Logo />
        </button>
        <div className="h-7 w-px bg-line" />
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 font-semibold text-primary"
        >
          <ChevronLeft size={20} />
          Back
        </button>
      </header>

      <main className="mx-auto w-full max-w-[720px] px-5 py-10 sm:py-14">
        <h1 className="text-[28px] font-extrabold leading-tight tracking-[-0.02em] text-ink sm:text-[32px]">
          {title}
        </h1>
        <p className="mt-2 text-[13px] text-ink-faint">Last updated {updated}</p>
        <div className="mt-8 space-y-7">{children}</div>

        <p className="mt-12 border-t border-line pt-6 text-[13px] leading-relaxed text-ink-muted">
          Questions about this page? Email{' '}
          <a
            href={`mailto:${SUPPORT}`}
            className="font-medium text-primary hover:underline"
          >
            {SUPPORT}
          </a>
          .
        </p>
      </main>
    </div>
  )
}

function Section({ heading, children }) {
  return (
    <section>
      <h2 className="text-[17px] font-bold text-ink">{heading}</h2>
      <div className="mt-2.5 space-y-3 text-[15px] leading-relaxed text-ink-soft">
        {children}
      </div>
    </section>
  )
}

export function Terms() {
  return (
    <LegalShell title="Terms of Service" updated="24 August 2026">
      <Section heading="What Liffto does">
        <p>
          Liffto creates QR codes. Static codes carry their content inside the
          image itself. Dynamic codes point at a short link we host, which lets
          you change where a printed code leads and see how many times it has
          been scanned.
        </p>
      </Section>

      <Section heading="Your account">
        <p>
          Signing in happens through Google. You are responsible for the Google
          account you use and for the activity that happens under it.
        </p>
        <p>
          Every feature is free. There is no paid tier, no trial, and nothing to
          cancel.
        </p>
      </Section>

      <Section heading="What you put in your codes">
        <p>
          The content of your codes is yours, and you keep every right you
          already had in it. You are responsible for having the right to use it
          — including anyone else&apos;s contact details you put on a card.
        </p>
        <p>
          Do not use Liffto to point people at malware, phishing pages, or
          anything illegal where you or your audience live. We may disable a
          code or an account that does.
        </p>
      </Section>

      <Section heading="Dynamic codes depend on us staying up">
        <p>
          A static code keeps working forever, because nothing about it depends
          on our servers. A dynamic code resolves through our short link, so it
          works for as long as the service and your account are active. This is
          worth weighing before printing a dynamic code onto something
          permanent.
        </p>
        <p>
          The service is provided as it is. We do not promise uninterrupted
          availability, and we are not liable for losses arising from a code
          that could not be resolved.
        </p>
      </Section>

      <Section heading="Ending things">
        <p>
          You can stop using Liffto at any time. To have your account and its
          codes removed, email {SUPPORT} — the in-app option currently signs you
          out rather than deleting anything, so a request to us is the way to
          get it done.
        </p>
        <p>
          Deleting an account stops its dynamic codes from resolving. Anything
          already printed will no longer lead anywhere.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          If these terms change in a way that affects you, the date at the top
          of this page changes with them.
        </p>
      </Section>
    </LegalShell>
  )
}

export function Privacy() {
  return (
    <LegalShell title="Privacy Policy" updated="24 August 2026">
      <Section heading="What we collect">
        <p>
          <strong className="font-semibold text-ink">From Google, when you sign in:</strong>{' '}
          your name, email address, and profile picture. We do not receive or
          store your Google password.
        </p>
        <p>
          <strong className="font-semibold text-ink">From you, as you use Liffto:</strong>{' '}
          the codes you create and everything you put in them — links, contact
          details, Wi-Fi credentials, event details, and any image you upload —
          plus any profile photo or phone number you add yourself.
        </p>
        <p>
          <strong className="font-semibold text-ink">Automatically:</strong> a count of
          how many times each dynamic code has been scanned, and a record of the
          devices signed in to your account so you can review and sign them out.
        </p>
      </Section>

      <Section heading="What we do not collect">
        <p>
          No payment details, because there is nothing to pay for. No
          advertising or tracking cookies. We do not sell your data or share it
          with advertisers.
        </p>
        <p>
          Scan counts are a total, not a profile: we do not record who scanned a
          code.
        </p>
      </Section>

      <Section heading="What is public">
        <p>
          This is the part most worth understanding. When a code has no
          destination of its own — a contact card, Wi-Fi details, an event — the
          scan opens a page we host showing that content. Anyone who scans the
          code, or who has its link, can see it. There is no sign-in on it by
          design, because a stranger scanning a business card should not have to
          make an account.
        </p>
        <p>
          Put nothing in a code that you would not hand to whoever picks it up.
        </p>
      </Section>

      <Section heading="Who else handles it">
        <p>
          Google, for sign-in. Our hosting and database providers, which store
          the data on our behalf and do not use it for anything else. That is
          the whole list.
        </p>
      </Section>

      <Section heading="How long we keep it">
        <p>
          Your codes and account stay until you ask us to remove them. Email{' '}
          {SUPPORT} to request deletion, correction, or a copy of what we hold
          about you — the in-app delete option currently signs you out rather
          than deleting anything, so a request to us is the reliable route.
        </p>
      </Section>

      <Section heading="Changes">
        <p>
          If this policy changes, the date at the top of this page changes with
          it.
        </p>
      </Section>
    </LegalShell>
  )
}
