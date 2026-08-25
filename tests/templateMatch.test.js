import { describe, it, expect } from 'vitest'
import { findActiveTemplate, filterTemplates } from '../src/lib/templateMatch'
import { defaultDesign } from '../src/lib/store'

// The built-ins, as DesignQR defines them.
const CLASSIC = { label: 'Classic', builtIn: true, design: { bodyPattern: 'square', cornerStyle: 0 } }
const ROUNDED = { label: 'Rounded', builtIn: true, design: { bodyPattern: 'rounded', cornerStyle: 4 } }
const DOTS = { label: 'Dots', builtIn: true, design: { bodyPattern: 'dots', cornerStyle: 3 } }
const BRANDED = {
  label: 'Branded',
  builtIn: true,
  design: {
    bodyPattern: 'classy-rounded',
    cornerStyle: 8,
    bodyGradient: true,
    bodyColor1: '#1B59F5',
    bodyColor2: '#16C2C8',
  },
}
const BUILTINS = [CLASSIC, ROUNDED, DOTS, BRANDED]

const withDesign = (over) => ({ ...defaultDesign(), ...over })

// How the app really saves one: a full copy of the design at the time. Every
// value, which is why these outrank the built-ins on size alone.
const saved = (label, over = {}) => ({
  label,
  design: { ...defaultDesign(), ...over },
})

describe('which template a design corresponds to', () => {
  it('names the template that was applied', () => {
    const design = withDesign(ROUNDED.design)
    expect(findActiveTemplate(BUILTINS, design)?.label).toBe('Rounded')
  })

  it('stops naming it once the design is edited away from it', () => {
    // The reason this is derived and not remembered: change the pattern and
    // the code no longer looks like Rounded, so the picker must not claim it.
    const design = withDesign({ ...ROUNDED.design, bodyPattern: 'dots' })
    expect(findActiveTemplate(BUILTINS, design)?.label).not.toBe('Rounded')
  })

  it('still names it when an unrelated value changes', () => {
    // Rounded says nothing about the logo, so setting one leaves it in effect.
    const design = withDesign({ ...ROUNDED.design, logo: 'company' })
    expect(findActiveTemplate(BUILTINS, design)?.label).toBe('Rounded')
  })

  it('prefers the most specific match when nothing was picked', () => {
    // A saved template pinning only the pattern matches wherever Dots does,
    // but Dots describes more of the design, so it should win.
    const looseDots = { label: 'Just dots', design: { bodyPattern: 'dots' } }
    const design = withDesign(DOTS.design)
    expect(findActiveTemplate([...BUILTINS, looseDots], design)?.label).toBe('Dots')
  })

  it('names the template that was picked, even when a broader one also fits', () => {
    // The bug this was written for. A saved template setting a single colour
    // applied to an otherwise untouched code leaves Classic matching too — and
    // Classic pins two values to the saved one's one, so ranking by
    // specificity named Classic straight after the person chose the other.
    const mine = { label: 'My template 42', design: { bodyColor1: '#abcdef' } }
    const templates = [...BUILTINS, mine]
    const design = withDesign(mine.design)

    expect(findActiveTemplate(templates, design)?.label).toBe('Classic')
    expect(findActiveTemplate(templates, design, 'My template 42')?.label).toBe(
      'My template 42',
    )
  })

  it('drops the picked template once the design moves away from it', () => {
    const mine = { label: 'My template 42', design: { bodyColor1: '#abcdef' } }
    const templates = [...BUILTINS, mine]
    const design = withDesign({ bodyColor1: '#ff0000' })

    expect(
      findActiveTemplate(templates, design, 'My template 42')?.label,
    ).not.toBe('My template 42')
  })

  it('calls an untouched design Classic, not a saved template equal to it', () => {
    // Saving stores the whole design, so a template saved without changing
    // anything is a thirteen-value match for the defaults, against Classic's
    // two. Ranking on size alone labelled a brand-new code "My template 1".
    const templates = [...BUILTINS, saved('My template 1')]
    expect(findActiveTemplate(templates, defaultDesign())?.label).toBe('Classic')
  })

  it('goes back to Classic when the design is reset', () => {
    // Reset restores the defaults and clears the pick. Passing no pick is what
    // DesignQR does after resetDesign; before it did, a saved template equal to
    // the defaults kept its name on the button because it still matched.
    const templates = [...BUILTINS, saved('My template 27')]
    expect(
      findActiveTemplate(templates, defaultDesign(), 'My template 27')?.label,
    ).toBe('My template 27')
    expect(findActiveTemplate(templates, defaultDesign(), null)?.label).toBe(
      'Classic',
    )
  })

  it('still names a saved template while it is the one picked', () => {
    // The preference for built-ins must not swallow an explicit choice.
    const mine = saved('My template 8', { bodyColor1: '#abcdef' })
    const templates = [...BUILTINS, mine]
    const design = withDesign({ bodyColor1: '#abcdef' })
    expect(findActiveTemplate(templates, design, 'My template 8')?.label).toBe(
      'My template 8',
    )
  })

  it('ignores a picked template that no longer exists', () => {
    const design = withDesign(ROUNDED.design)
    expect(findActiveTemplate(BUILTINS, design, 'Deleted one')?.label).toBe(
      'Rounded',
    )
  })

  it('matches a multi-value template only when every value is present', () => {
    const design = withDesign({ ...BRANDED.design, bodyColor2: '#FF0000' })
    expect(findActiveTemplate(BUILTINS, design)?.label).not.toBe('Branded')
  })

  it('reports Classic for an untouched design, because that is what it is', () => {
    expect(findActiveTemplate(BUILTINS, defaultDesign())?.label).toBe('Classic')
  })

  it('returns nothing when no template fits', () => {
    const design = withDesign({ bodyPattern: 'extra-rounded', cornerStyle: 7 })
    expect(findActiveTemplate(BUILTINS, design)).toBeNull()
  })

  it('ignores an empty template rather than letting it match everything', () => {
    const empty = { label: 'Empty', design: {} }
    expect(findActiveTemplate([empty], defaultDesign())).toBeNull()
    expect(findActiveTemplate([empty, CLASSIC], defaultDesign())?.label).toBe(
      'Classic',
    )
  })

  it('survives missing input without throwing', () => {
    expect(findActiveTemplate([], defaultDesign())).toBeNull()
    expect(findActiveTemplate(BUILTINS, null)).toBeNull()
    expect(findActiveTemplate([{ label: 'x' }], defaultDesign())).toBeNull()
  })
})

describe('searching a long template list', () => {
  const many = Array.from({ length: 100 }, (_, i) => ({
    label: `My template ${i + 1}`,
    design: { bodyColor1: '#123456' },
  }))

  it('returns everything for an empty query', () => {
    expect(filterTemplates(many, '')).toHaveLength(100)
    expect(filterTemplates(many, '   ')).toHaveLength(100)
  })

  it('narrows a hundred templates down to the one being looked for', () => {
    expect(filterTemplates(many, 'template 42').map((t) => t.label)).toEqual([
      'My template 42',
    ])
  })

  it('ignores case', () => {
    expect(filterTemplates([ROUNDED, DOTS], 'ROUND').map((t) => t.label)).toEqual([
      'Rounded',
    ])
  })

  it('returns nothing when the query matches nothing', () => {
    expect(filterTemplates(many, 'zzzz')).toEqual([])
  })
})
