import { isValidWebsiteUrl, encodeContent } from './qrTypes'
import { isDynamicRecord } from './qrRecord'

// The link to offer for a saved QR record, or null when there is nothing to
// open.
//
// Only dynamic codes have a destination. A dynamic code encodes a short link we
// host, and the destination is where that link forwards to — a real thing to
// open, and the thing you would change to repoint the code. A static code
// encodes its content straight into the pattern: scanning it joins a network,
// saves a contact, shows the text. There is no redirect and so nothing this
// heading could truthfully name.
//
// Checking the record's own url field is not enough, which is what the first
// attempt at this got wrong. Static records carry a url too, and it is not
// always the content: a static Text code was found holding the short URL for
// its slug, so the dialog offered "Destination URL
// https://liffto-qr.vercel.app/iLI2mv" for a code that encodes a line of text
// and goes nowhere near that address. The field passed every validity check
// available and was still the wrong thing to show, so the type of the code has
// to decide it.
//
// The value is normalised as well as checked. isValidWebsiteUrl accepts a bare
// "example.com" — the same tolerance the create form has — but in an href that
// is a *relative* path, which lands on the current page exactly as an empty one
// does. Running it back through the url encoder gives the absolute form.
export function destinationUrl(row = {}) {
  if (!isDynamicRecord(row)) return null
  const raw = row?.url
  if (!isValidWebsiteUrl(raw)) return null
  return encodeContent('url', { url: raw })
}
