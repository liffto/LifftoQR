import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('../src/api/axios', () => ({
  api: { get: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

import { api } from '../src/api/axios'
import {
  listUserTemplates,
  saveUserTemplate,
  deleteUserTemplate,
} from '../src/api/qrcode/userTemplates'

// What the endpoint actually returns, camelCased by the response schema's
// serialization aliases the way every other template response is.
const apiTemplate = (over = {}) => ({
  id: 1,
  label: 'Brand blue',
  logo: null,
  logoSize: 0.4,
  frame: 'classic',
  frameText: 'SCAN ME',
  bodyPattern: 'classy-rounded',
  bodyGradient: true,
  bodyColor1: '#1B59F5',
  bodyColor2: '#16C2C8',
  cornerStyle: 8,
  cornerGradient: false,
  cornerColor1: '#1B59F5',
  cornerColor2: '#000000',
  background: '#FFFFFF',
  ...over,
})

beforeEach(() => vi.clearAllMocks())

describe('saved templates from the account', () => {
  it('carries the whole design through, not just the name', () => {
    // The bug this is here for. The response schema first returned snake_case,
    // and templateToDesign reads camelCase with a default for anything it
    // cannot find — so nothing failed. The picker listed the template under the
    // right name and applied a plain black square. A silent wrong answer, which
    // only showed up by looking at the rendered code.
    api.get.mockResolvedValue({ data: [apiTemplate()] })
    return listUserTemplates().then(([t]) => {
      expect(t.label).toBe('Brand blue')
      expect(t.design.bodyPattern).toBe('classy-rounded')
      expect(t.design.bodyColor1).toBe('#1B59F5')
      expect(t.design.bodyColor2).toBe('#16C2C8')
      expect(t.design.bodyGradient).toBe(true)
      expect(t.design.cornerStyle).toBe(8)
      expect(t.design.frame).toBe('classic')
      expect(t.design.frameText).toBe('SCAN ME')
    })
  })

  it('does not quietly hand back the defaults', async () => {
    api.get.mockResolvedValue({ data: [apiTemplate()] })
    const [t] = await listUserTemplates()
    // Every value above differs from the default design, so if the mapping
    // breaks again this fails rather than passing on a black square.
    expect(t.design.bodyPattern).not.toBe('square')
    expect(t.design.bodyColor1).not.toBe('#000000')
    expect(t.design.cornerStyle).not.toBe(0)
  })

  it('survives an empty list', async () => {
    api.get.mockResolvedValue({ data: [] })
    expect(await listUserTemplates()).toEqual([])
    api.get.mockResolvedValue({ data: null })
    expect(await listUserTemplates()).toEqual([])
  })

  it('sends the design in the shape the API expects', async () => {
    api.put.mockResolvedValue({ data: apiTemplate() })
    await saveUserTemplate('Brand blue', {
      bodyPattern: 'dots',
      bodyColor1: '#FF0000',
      cornerStyle: 3,
    })
    const [url, body] = api.put.mock.calls[0]
    expect(url).toBe('/templates')
    expect(body.label).toBe('Brand blue')
    // snake_case going out, camelCase coming back — the same asymmetry the
    // per-QR template already has.
    expect(body.body_pattern).toBe('dots')
    expect(body.body_color_1).toBe('#FF0000')
    expect(body.corner_style).toBe(3)
  })

  it('deletes by id', async () => {
    api.delete.mockResolvedValue({})
    await deleteUserTemplate(7)
    expect(api.delete).toHaveBeenCalledWith('/templates/7')
  })
})
