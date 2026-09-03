import { useEffect, useState } from 'react'
import { getTheme, toggleTheme, THEME_EVENT } from '../lib/theme'

/**
 * The current theme, and the switch for it.
 *
 * Always starts at 'light', even for someone who chose dark. The landing page
 * is prerendered at build time, where there is no localStorage, so reading the
 * real value during the first render would disagree with the server markup and
 * make hydration throw the whole page away. The palette itself is never wrong
 * in the meantime — the inline script in index.html adds the `dark` class
 * before the first paint — so all that lags is which icon is showing, and only
 * until the effect below runs.
 *
 * Subscribing to THEME_EVENT rather than just reading once keeps every toggle
 * in the tree agreeing with every other one, whichever was pressed.
 */
export function useTheme() {
  const [theme, setThemeVal] = useState('light')

  useEffect(() => {
    const sync = () => setThemeVal(getTheme())
    sync()
    window.addEventListener(THEME_EVENT, sync)
    return () => window.removeEventListener(THEME_EVENT, sync)
  }, [])

  return [theme, toggleTheme]
}

export default useTheme
