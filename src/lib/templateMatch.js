// Which saved template a QR design currently corresponds to.
//
// A template is a *partial* design — Rounded is only
// { bodyPattern: 'rounded', cornerStyle: 4 } — that gets merged over whatever
// the design already holds. So a template is in effect exactly while every
// value it sets is still present.
//
// Worked out from the design rather than remembered from the click, on purpose.
// Storing the choice would leave the picker naming a template the code no
// longer resembles the moment someone nudges a colour, and it would be
// forgotten across a reload that the draft itself survives. Derived, it can
// only ever say something true.
//
// Templates overlap constantly, because most of them pin only a value or two
// and say nothing about the rest. A saved template setting just a body colour
// fits any design carrying that colour — including one that also still matches
// Classic, which pins a pattern and a corner style.
//
// So `picked` decides it when there is one. Ranking purely by how much of the
// design a template accounts for gets this visibly wrong: apply a saved
// template that sets one colour to an otherwise untouched code and Classic,
// with its two values, outranks the template the person just chose. The choice
// holds only while it still describes the design — one edit away from it and
// this falls through to the ranking below, so the label can never name a
// template the code no longer resembles.
//
// With nothing picked — a fresh page, or a design edited away from the pick —
// the most specific match wins, so the label accounts for as much of the design
// as it can. Ties keep the earlier template, putting built-ins ahead of saved
// ones.

const describesDesign = (tpl, design) => {
  const entries = Object.entries(tpl?.design || {})
  // An empty template would otherwise match everything while saying nothing.
  if (entries.length === 0) return false
  return entries.every(([key, value]) => design[key] === value)
}

export function findActiveTemplate(templates = [], design = {}, picked = null) {
  if (!design) return null

  if (picked) {
    const chosen = templates.find((t) => t?.label === picked)
    if (chosen && describesDesign(chosen, design)) return chosen
  }

  let best = null
  let bestSize = -1

  templates.forEach((tpl) => {
    if (!describesDesign(tpl, design)) return
    const size = Object.keys(tpl.design).length
    if (size > bestSize) {
      best = tpl
      bestSize = size
    }
  })

  return best
}

// Case-insensitive substring filter for the picker's search box.
export function filterTemplates(templates = [], query = '') {
  const q = query.trim().toLowerCase()
  if (!q) return templates
  return templates.filter((t) => (t?.label || '').toLowerCase().includes(q))
}
