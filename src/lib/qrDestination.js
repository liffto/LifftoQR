import { isValidWebsiteUrl, encodeContent } from './qrTypes'

// The link to offer for a saved QR record, or null when there is nothing to
// open.
//
// Nine of the nineteen types — Wi-Fi, contact cards, plain text, SMS, phone,
// email, events, locations, coupons — encode their content directly into the
// pattern and have no destination at all. Their records carry an empty url, and
// the details dialog used to render a "Destination URL" heading over an empty
// line with an open-link icon beside it regardless. An empty href resolves to
// the current page, so the only thing that link could do was reload the page
// behind the dialog.
//
// The value is normalised, not just checked. isValidWebsiteUrl accepts a bare
// "example.com" — the same tolerance the create form has — but putting that in
// an href makes it a *relative* path, which lands on the current page exactly
// as an empty one does. Running it back through the url encoder gives the
// absolute form.
export function destinationUrl(row = {}) {
  const raw = row?.url
  if (!isValidWebsiteUrl(raw)) return null
  return encodeContent('url', { url: raw })
}
