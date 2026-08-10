// Light/dark theme control. Light is the default; the choice persists to
// localStorage and is applied by toggling the `dark` class on <html>
// (Tailwind `darkMode: 'class'`). A matching inline script in index.html
// applies it before paint to avoid a flash.

const KEY = 'liffto.theme'
export const THEME_EVENT = 'liffto:theme'

export const getTheme = () => {
  try {
    return localStorage.getItem(KEY) === 'dark' ? 'dark' : 'light'
  } catch {
    return 'light'
  }
}

const apply = (theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }
}

export const setTheme = (theme) => {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    /* ignore storage failures */
  }
  // Flip the whole palette in a single frame. Components carry `transition-*`
  // utilities for hover states, which would otherwise each animate the colour
  // change on their own timeline and make the switch look staggered. Suppress
  // all transitions for the one frame of the flip, then restore them.
  if (typeof document !== 'undefined') {
    const root = document.documentElement
    root.classList.add('no-transitions')
    apply(theme)
    // Force a synchronous reflow so the flip paints before transitions return.
    void root.offsetWidth
    if (typeof window !== 'undefined' && window.requestAnimationFrame) {
      window.requestAnimationFrame(() =>
        root.classList.remove('no-transitions'),
      )
    } else {
      root.classList.remove('no-transitions')
    }
  } else {
    apply(theme)
  }
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(THEME_EVENT))
  }
}

export const toggleTheme = () =>
  setTheme(getTheme() === 'dark' ? 'light' : 'dark')
