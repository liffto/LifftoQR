import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { advanceOnEnter } from '../src/lib/enterToAdvance'

// A stand-in for the real forms, carrying the same mix of controls that the
// app's own field grid does: hidden file inputs, a readOnly display field, an
// opacity-0 colour swatch, a range slider, and a trailing textarea. Every one
// of those is focusable, and none is a sensible place to land after typing.
function Form({ onLast }) {
  return (
    <div onKeyDown={(e) => advanceOnEnter(e, { onLast })}>
      <input type="file" style={{ display: 'none' }} aria-label="upload" />
      <input type="text" aria-label="first" />
      <input type="text" aria-label="second" />
      <input type="email" readOnly value="nobody@example.com" aria-label="ro" />
      <input type="color" defaultValue="#ffffff" aria-label="colour" />
      <input type="range" defaultValue="1" aria-label="slider" />
      <select aria-label="pick" defaultValue="a">
        <option value="a">a</option>
        <option value="b">b</option>
      </select>
      <textarea aria-label="notes" />
    </div>
  )
}

// A form whose final field is typed, so Enter there has nowhere left to go.
function ShortForm({ onLast }) {
  return (
    <div onKeyDown={(e) => advanceOnEnter(e, { onLast })}>
      <input type="text" aria-label="only" />
    </div>
  )
}

const enter = (el, init) => fireEvent.keyDown(el, { key: 'Enter', ...init })

const pressEnterOn = (label) => {
  const el = screen.getByLabelText(label)
  el.focus()
  return enter(el)
}

describe('Enter advances to the next field', () => {
  it('moves focus to the next typed field', () => {
    render(<Form />)
    pressEnterOn('first')
    expect(screen.getByLabelText('second')).toHaveFocus()
  })

  it('skips readOnly, colour and range controls', () => {
    render(<Form />)
    pressEnterOn('second')
    expect(screen.getByLabelText('pick')).toHaveFocus()
  })

  it('skips a display:none file input', () => {
    render(<Form />)
    // The file input is first in the DOM; landing on it would be invisible.
    pressEnterOn('first')
    expect(screen.getByLabelText('upload')).not.toHaveFocus()
  })

  it('carries on from a select into the textarea', () => {
    render(<Form />)
    pressEnterOn('pick')
    expect(screen.getByLabelText('notes')).toHaveFocus()
  })

  it('leaves Enter alone inside a textarea so newlines still work', () => {
    render(<Form />)
    const notes = screen.getByLabelText('notes')
    notes.focus()
    // fireEvent returns false when something called preventDefault.
    expect(enter(notes)).toBe(true)
    expect(notes).toHaveFocus()
  })

  it('runs onLast in the final field rather than wrapping to the top', () => {
    const onLast = vi.fn()
    render(<ShortForm onLast={onLast} />)
    const only = screen.getByLabelText('only')
    pressEnterOn('only')
    expect(onLast).toHaveBeenCalledTimes(1)
    expect(only).not.toHaveFocus()
  })

  it('does not call onLast while fields remain', () => {
    const onLast = vi.fn()
    render(<Form onLast={onLast} />)
    pressEnterOn('first')
    expect(onLast).not.toHaveBeenCalled()
  })

  it('ignores modified Enter so Shift+Enter keeps its meaning', () => {
    render(<Form />)
    const first = screen.getByLabelText('first')
    first.focus()
    enter(first, { shiftKey: true })
    expect(first).toHaveFocus()
  })

  it('defers to a handler that already dealt with the key', () => {
    render(
      <div onKeyDown={(e) => advanceOnEnter(e)}>
        <input aria-label="submits" onKeyDown={(e) => e.preventDefault()} />
        <input aria-label="after" />
      </div>,
    )
    const submits = screen.getByLabelText('submits')
    submits.focus()
    enter(submits)
    expect(submits).toHaveFocus()
  })
})
