import { useLayoutEffect, useState } from 'react'
import { MoonIcon, SunIcon } from '@wordle/icons'

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
      {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
    </button>
  )
}

export default ThemeToggle
