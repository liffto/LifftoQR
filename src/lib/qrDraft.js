// Builds the in-progress QR record ("draft") that the create flow carries from
// step to step. Shared by the in-app create page and the public landing page so
// both produce an identical record — the only difference is where they navigate.

import { randomSlug, uid, todayISO, defaultDesign, setDraft } from './store'
import {
  findType,
  deriveContentName,
  encodeContent,
  defaultContent,
} from './qrTypes'

/**
 * Has the visitor actually put something into this draft?
 *
 * Compared field by field against the type's own defaults rather than just
 * checking for blanks: defaultContent pre-fills every select with its first
 * option, so a Wi-Fi draft nobody has touched still arrives carrying
 * `auth: 'WPA'`. Treating that as content would make the discard warning fire
 * on every type switch, which trains people to click through it.
 */
export const draftHasContent = (draft) => {
  if (!draft || !draft.typeKey) return false
  const defaults = defaultContent(draft.typeKey)
  const content = draft.content || {}
  return Object.keys(defaults).some(
    (key) =>
      JSON.stringify(content[key] ?? '') !== JSON.stringify(defaults[key] ?? ''),
  )
}

// `designOverride` lets a caller seed the design — e.g. the landing hero passes
// the style the visitor picked so it survives into the studio.
export const buildRecord = (typeKey, content, dynamicPref, designOverride) => {
  const t = findType(typeKey)
  // Some types can't be static (vCard, Coupon) — they force dynamic.
  const eff = t.dynamicCapable && (t.requiresDynamic || dynamicPref)
  return {
    id: uid(),
    typeKey,
    type: t.label,
    content,
    name: deriveContentName(typeKey, content),
    url: t.kind === 'link' ? encodeContent(typeKey, content) : '',
    slug: randomSlug(),
    dynamic: eff,
    qrType: eff ? 'Dynamic QR' : 'Static QR',
    folder: 'Untitled',
    status: 'Active',
    scans: 0,
    editedOn: todayISO(),
    design: { ...defaultDesign(), ...(designOverride || {}) },
  }
}

// Build + persist as the active draft, returning the record.
export const startDraft = (typeKey, content, dynamicPref, designOverride) => {
  const record = buildRecord(typeKey, content, dynamicPref, designOverride)
  setDraft(record)
  return record
}
