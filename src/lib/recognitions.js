import startupIndiaLogo from '../assets/logos/startup-india.png'
import startupTnLogo from '../assets/logos/startup-tn.png'
import msmeLogo from '../assets/logos/msme.png'

// Who we are registered with, and the number that proves each one.
//
// This is the only place the list is written down. The section on the landing
// page and the line in the footer both read from here, so adding a recognition
// is one edit and there is no second copy to drift.
//
// ── Read this before editing ────────────────────────────────────────────────
//
// `number` must be the real registration number from the actual certificate,
// copied exactly. Never a placeholder, never an example, never a plausible
// guess. These identify a company to a government department: a wrong one is
// not a typo in marketing copy, it is a false statement about a statutory
// registration, and the portals below will happily show a visitor that it does
// not exist. An entry with `number: null` simply renders without the number —
// which is the correct behaviour while a certificate is being located, because
// the claim still holds and only the proof is missing.
//
// `verifyUrl` goes to the issuing body's own portal, never to a copy of a
// certificate we host. The point is that the visitor checks with them, not
// with us.
//
// `image` is the issuing body's own mark, taken from its own site and only
// resized — never redrawn, recoloured, or cropped. A government mark
// approximated by hand is worse than no mark, and recolouring one to suit a
// dark theme is not allowed either, which is why the card sits each logo on a
// white plaque in both themes rather than inverting it.
//
// One of these is not like the others. The MSME mark is built on the State
// Emblem of India, and the State Emblem of India (Prohibition of Improper Use)
// Act, 2005 is a criminal statute rather than a brand guideline — the schedule
// to it governs who may display the emblem and in what context. Displaying it
// is a statement that we are registered with that Ministry, which is only safe
// while the Udyam registration is live and in our name. If that ever lapses,
// this entry comes off the page the same day. The registration number below is
// the part that makes the claim checkable, so it is the part worth chasing.
export const RECOGNITIONS = [
  {
    key: 'startup-india',
    name: 'Startup India',
    issuer: 'DPIIT, Government of India',
    // The #startupindia wordmark, from startupindia.gov.in, resized only.
    image: startupIndiaLogo,
    // e.g. 'DIPP12345' — from the DPIIT recognition certificate.
    number: null,
    numberLabel: 'DPIIT recognition no.',
    verifyUrl: 'https://www.startupindia.gov.in/',
  },
  {
    key: 'startup-tn',
    name: 'StartupTN',
    issuer: 'Government of Tamil Nadu',
    // StartupTN's own composite mark, from startuptn.in, resized only. It
    // contains the Tamil Nadu state emblem as part of the lockup — which is
    // exactly why it is used whole and never taken apart.
    image: startupTnLogo,
    // e.g. the TN startup / seed-fund registration id.
    number: null,
    numberLabel: 'Registration no.',
    verifyUrl: 'https://startuptn.in/',
  },
  {
    key: 'msme',
    name: 'MSME',
    issuer: 'Ministry of MSME, Udyam',
    // The Ministry's own mark, supplied by us, resized only. It is built on
    // the State Emblem of India — see the note above the list: it goes on the
    // page whole, at its own proportions, never recoloured or taken apart.
    image: msmeLogo,
    // A stacked mark, roughly square, where the other two are wide wordmarks.
    // At the height that suits a wordmark this one would be 35px across and
    // unreadable, so it gets its own. This is why the plaque has a fixed
    // height and the logo inside it does not.
    imageClass: 'h-12',
    // e.g. 'UDYAM-TN-00-0000000' — from the Udyam registration certificate.
    number: null,
    numberLabel: 'Udyam registration no.',
    verifyUrl: 'https://udyamregistration.gov.in/Udyam_Verify.aspx',
  },
]

// Whether any entry can currently show its proof. Used to decide whether the
// "check the number yourself" line is worth saying — inviting someone to verify
// numbers that are not on the page yet would read as bluffing.
export const hasVerifiableNumber = RECOGNITIONS.some((r) => Boolean(r.number))

export const HOME_REGION = 'Tamil Nadu, India'
