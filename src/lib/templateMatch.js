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
// a built-in is preferred, and only then does specificity decide.
//
// Preferring built-ins is not arbitrary. Saving a template stores the whole
// design, all thirteen values, while a built-in pins two or three. So any saved
// template matches more of the design than any built-in can, and ranking by
// specificity alone handed every label to a saved template: a code sitting at
// its untouched defaults was labelled "My template 1" purely because that
// template had been saved without changing anything, and Classic — which is
// exactly what an untouched design is — could never outrank it.
//
// The cost is that a design which happens to match a saved template exactly,
// without it having been chosen here, is labelled with the built-in instead.
// That names less of the design than it could, but it is predictable, and the
// case that matters — the person picking a template — is handled above.

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
  let bestRank = null

  templates.forEach((tpl) => {
    if (!describesDesign(tpl, design)) return
    const rank = [tpl.builtIn ? 1 : 0, Object.keys(tpl.design).length]
    if (
      !bestRank ||
      rank[0] > bestRank[0] ||
      (rank[0] === bestRank[0] && rank[1] > bestRank[1])
    ) {
      best = tpl
      bestRank = rank
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
