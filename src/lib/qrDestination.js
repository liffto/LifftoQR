import { isValidWebsiteUrl, encodeContent } from './qrTypes'
import { isDynamicRecord } from './qrRecord'

// The link to offer for a saved QR record, or null when there is nothing to
// open.
//
// Two kinds of code have somewhere to go.
//
// A dynamic code encodes a short link we host, and its destination is where
// that link forwards to — a real address, and the one you would change to
// repoint the code.
//
// A static Website URL code has no redirect, but the address is the content: it
// is written into the pattern, and scanning it opens exactly that. Naming it is
// as true here as for a dynamic code, so the type earns the row on its own.
//
// Everything else static has nothing to name. Wi-Fi joins a network, a contact
// card saves a contact, Text shows a line of text — none of them go anywhere.
//
// The record's own url field cannot make this decision, which is what the first
// two attempts at this got wrong. Static records carry a url whatever their
// type, and it is not always the content: a static Text code was found holding
// the short URL for its own slug, so the dialog offered "Destination URL
// https://liffto-qr.vercel.app/iLI2mv" for a code that encodes a line of text
// and sends nobody there. The field passed every validity check available and
// was still the wrong thing to show. Hence the type decides, and the url is
// only consulted afterwards.
//
// The value is normalised as well as checked. isValidWebsiteUrl accepts a bare
// "example.com" — the same tolerance the create form has — but in an href that
// is a *relative* path, which lands on the current page exactly as an empty one
// does. Running it back through the url encoder gives the absolute form.
export function destinationUrl(row = {}) {
  const isWebsiteCode = row?.typeKey === 'url'
  if (!isDynamicRecord(row) && !isWebsiteCode) return null
  const raw = row?.url
  if (!isValidWebsiteUrl(raw)) return null
  return encodeContent('url', { url: raw })
}
