import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, within } from '@testing-library/react'
import QrFilterMenu from '../src/components/QrFilterMenu'

// This is the one piece of the dashboard that can be exercised directly — it
// takes its state as props and needs no session, so the interaction is checked
// here rather than reasoned about.
const setup = (props = {}) => {
  const handlers = {
    onChangeType: vi.fn(),
    onChangeStatus: vi.fn(),
    onClear: vi.fn(),
  }
  const utils = render(
    <QrFilterMenu
      type="All"
      status="Any status"
      {...handlers}
      {...props}
    />,
  )
  const trigger = screen.getByRole('button', { name: /filters/i })
  return { ...utils, ...handlers, trigger }
}

const openMenu = (trigger) => {
  fireEvent.click(trigger)
  return screen.getByRole('dialog', { name: /filter qr codes/i })
}

describe('the dashboard filter menu', () => {
  it('starts closed', () => {
    const { trigger } = setup()
    expect(trigger).toHaveAttribute('aria-expanded', 'false')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('opens to both groups of choices', () => {
    const { trigger } = setup()
    const menu = openMenu(trigger)
    expect(trigger).toHaveAttribute('aria-expanded', 'true')
    expect(within(menu).getByRole('radiogroup', { name: 'Type' })).toBeInTheDocument()
    expect(within(menu).getByRole('radiogroup', { name: 'Status' })).toBeInTheDocument()
    expect(within(menu).getAllByRole('radio')).toHaveLength(6)
  })

  it('marks the current choice in each group', () => {
    const { trigger } = setup({ type: 'Dynamic QR', status: 'Inactive' })
    const menu = openMenu(trigger)
    const checked = within(menu)
      .getAllByRole('radio')
      .filter((r) => r.getAttribute('aria-checked') === 'true')
      .map((r) => r.textContent.trim())
    expect(checked).toEqual(['Dynamic QR', 'Inactive'])
  })

  it('reports a choice without closing, so both groups can be set', () => {
    const { trigger, onChangeType } = setup()
    const menu = openMenu(trigger)
    fireEvent.click(within(menu).getByRole('radio', { name: 'Static QR' }))
    expect(onChangeType).toHaveBeenCalledWith('Static QR')
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('says how many filters are on, for anyone who cannot see the dot', () => {
    // Hiding the pills means a shortened list stops explaining itself. The
    // trigger carries that state now, and it has to reach a screen reader too.
    // Each case is mounted alone — two menus in one document would give
    // getByRole two buttons to choose between.
    const cases = [
      [{}, 'Filters'],
      [{ type: 'Dynamic QR' }, /1 applied/i],
      [{ type: 'Dynamic QR', status: 'Active' }, /2 applied/i],
    ]
    cases.forEach(([props, expected]) => {
      const { trigger, unmount } = setup(props)
      expect(trigger).toHaveAccessibleName(expected)
      unmount()
    })
  })

  it('offers a reset only when there is something to reset', () => {
    const plain = setup()
    openMenu(plain.trigger)
    expect(screen.queryByRole('button', { name: /clear filters/i })).not.toBeInTheDocument()
    plain.unmount()

    const filtered = setup({ status: 'Active' })
    openMenu(filtered.trigger)
    fireEvent.click(screen.getByRole('button', { name: /clear filters/i }))
    expect(filtered.onClear).toHaveBeenCalled()
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('warns about the pair that can never match, before the list comes back empty', () => {
    const { trigger } = setup({ type: 'Static QR', status: 'Active' })
    const menu = openMenu(trigger)
    expect(within(menu).getByText(/no redirect to switch on or off/i)).toBeInTheDocument()
  })

  it('does not warn about combinations that can match', () => {
    const { trigger } = setup({ type: 'Dynamic QR', status: 'Active' })
    const menu = openMenu(trigger)
    expect(within(menu).queryByText(/no redirect to switch/i)).not.toBeInTheDocument()
  })

  it('closes on Escape and hands focus back to the button', () => {
    const { trigger } = setup()
    openMenu(trigger)
    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(trigger).toHaveFocus()
  })

  it('closes when something else is pressed', () => {
    const { trigger } = setup()
    openMenu(trigger)
    fireEvent.pointerDown(document.body)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })
})
