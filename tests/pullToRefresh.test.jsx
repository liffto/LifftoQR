import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { usePullToRefresh } from '../src/hooks/usePullToRefresh'

// jsdom has no Touch/TouchEvent, and the hook only reads clientY off the first
// touch — so a plain Event carrying a touches array is enough to drive it.
const touch = (type, y) => {
  const e = new Event(type, { bubbles: true, cancelable: true })
  const point = { clientY: y, clientX: 0 }
  e.touches = type === 'touchend' ? [] : [point]
  e.changedTouches = [point]
  return e
}

const drag = (ys) => {
  act(() => {
    window.dispatchEvent(touch('touchstart', ys[0]))
    for (const y of ys.slice(1)) window.dispatchEvent(touch('touchmove', y))
  })
}

const release = (y) => {
  act(() => {
    window.dispatchEvent(touch('touchend', y))
  })
}

const setPointer = (coarse) => {
  window.matchMedia = vi.fn().mockReturnValue({
    matches: coarse,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  })
}

const setScroll = (y) => {
  Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
  Object.defineProperty(document.documentElement, 'scrollTop', {
    value: y,
    configurable: true,
  })
}

beforeEach(() => {
  setPointer(true)
  setScroll(0)
  // Run rAF callbacks straight away so a pull is measurable in the same tick.
  vi.stubGlobal('requestAnimationFrame', (fn) => {
    fn()
    return 1
  })
  vi.stubGlobal('cancelAnimationFrame', () => {})
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('pull to refresh', () => {
  it('survives the small movements every real pull starts with', () => {
    // The bug this pins down: a first frame of 3px used to disarm the gesture
    // for good, so on a real phone — where the finger always passes through a
    // few pixels on its way down — the pull simply never engaged. It only
    // appeared to work when the first synthetic move happened to be large.
    const { result } = renderHook(() => usePullToRefresh(vi.fn()))
    drag([200, 203, 206, 210, 220, 240, 280])
    expect(result.current.pull).toBeGreaterThan(0)
  })

  it('resists the drag rather than tracking the finger one to one', () => {
    const { result } = renderHook(() => usePullToRefresh(vi.fn()))
    drag([200, 300])
    // Moving the indicator as far as the finger would let it be flung down the
    // screen; it should lag well behind.
    expect(result.current.pull).toBeLessThan(100 / 2)
    expect(result.current.pull).toBeGreaterThan(0)
  })

  it('refreshes when released past the threshold', async () => {
    const onRefresh = vi.fn().mockResolvedValue(undefined)
    const { result } = renderHook(() => usePullToRefresh(onRefresh))
    drag([200, 400])
    expect(result.current.ready).toBe(true)
    release(400)
    expect(onRefresh).toHaveBeenCalledTimes(1)
    await waitFor(() => expect(result.current.refreshing).toBe(false))
  })

  it('does nothing when released short of the threshold', () => {
    const onRefresh = vi.fn()
    const { result } = renderHook(() => usePullToRefresh(onRefresh))
    drag([200, 215])
    release(215)
    expect(onRefresh).not.toHaveBeenCalled()
    expect(result.current.pull).toBe(0)
  })

  it('lets go of the spinner even when the refresh fails', async () => {
    // Otherwise one network blip leaves the page looking busy forever.
    const onRefresh = vi.fn().mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => usePullToRefresh(onRefresh))
    drag([200, 400])
    release(400)
    await waitFor(() => expect(result.current.refreshing).toBe(false))
    expect(result.current.pull).toBe(0)
  })

  it('ignores a drag that starts partway down the page', () => {
    setScroll(400)
    const { result } = renderHook(() => usePullToRefresh(vi.fn()))
    drag([200, 400])
    expect(result.current.pull).toBe(0)
  })

  it('stands down when the drag turns into an upward scroll', () => {
    const { result } = renderHook(() => usePullToRefresh(vi.fn()))
    drag([200, 240])
    expect(result.current.pull).toBeGreaterThan(0)
    act(() => {
      window.dispatchEvent(touch('touchmove', 150))
    })
    expect(result.current.pull).toBe(0)
  })

  it('stays out of the way on a device with a mouse', () => {
    // A desktop has a scrollbar and a reload button; hijacking drags there
    // would only get in the way.
    setPointer(false)
    const { result } = renderHook(() => usePullToRefresh(vi.fn()))
    drag([200, 400])
    expect(result.current.pull).toBe(0)
  })

  it('will not start a second refresh while one is in flight', async () => {
    let resolve
    const onRefresh = vi.fn(() => new Promise((r) => (resolve = r)))
    const { result } = renderHook(() => usePullToRefresh(onRefresh))
    drag([200, 400])
    release(400)
    expect(result.current.refreshing).toBe(true)

    drag([200, 400])
    release(400)
    expect(onRefresh).toHaveBeenCalledTimes(1)

    await act(async () => {
      resolve()
    })
    await waitFor(() => expect(result.current.refreshing).toBe(false))
  })
})
