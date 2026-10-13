import { useLayoutEffect, useState } from 'react'

const THEME_STORAGE_KEY = 'wordle-theme'

function getInitialTheme() {
  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY)
    if (storedTheme === 'light' || storedTheme === 'dark') return storedTheme
  } catch {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function saveTheme(theme) {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)
    return true
  } catch {
    return false
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme)

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    saveTheme(theme)
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'dark' ? '#121213' : '#ffffff')
  }, [theme])

  return (
    <button
      aria-label={theme === 'dark' ? 'Use light mode' : 'Use dark mode'}
      aria-pressed={theme === 'dark'}
      className="header-icon-button"
      onClick={() => setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'))}
      type="button"
    >
      {theme === 'dark' ? (
        <svg aria-hidden="true" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.66 6.34l1.41-1.41" />
        </svg>
      ) : (
        <svg aria-hidden="true" className="theme-moon-icon" viewBox="0 0 24 24">
          <path d="M12 2A10 10 0 1 0 22 12 7.5 7.5 0 0 1 12 2Z" />
        </svg>
      )}
    </button>
  )
}

export default ThemeToggle
