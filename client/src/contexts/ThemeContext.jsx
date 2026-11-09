import { createContext, useContext, useEffect, useState } from 'react'

const THEME_PREFERENCES = ['light', 'dark', 'system']
const THEME_STORAGE_KEY = 'nagara-theme'

const ThemeContext = createContext(null)

function getStoredPreference() {
  try {
    const preference = window.localStorage.getItem(THEME_STORAGE_KEY)
    return THEME_PREFERENCES.includes(preference) ? preference : 'system'
  } catch (error) {
    console.warn('Could not read the saved Nagara theme preference.', error)
    return 'system'
  }
}

function resolveTheme(preference) {
  if (preference === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
  }

  return preference
}

function applyTheme(theme) {
  const root = document.documentElement
  root.dataset.theme = theme
  root.style.colorScheme = theme
}

export function ThemeProvider({ children }) {
  const [preference, setPreference] = useState(getStoredPreference)
  const [systemTheme, setSystemTheme] = useState(() => resolveTheme('system'))
  const resolvedTheme = preference === 'system' ? systemTheme : preference

  useEffect(() => {
    applyTheme(resolvedTheme)

    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, preference)
    } catch (error) {
      console.warn('Could not save the Nagara theme preference.', error)
    }
  }, [preference, resolvedTheme])

  useEffect(() => {
    if (preference !== 'system') {
      return undefined
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setSystemTheme(mediaQuery.matches ? 'dark' : 'light')
    const handleChange = (event) => {
      setSystemTheme(event.matches ? 'dark' : 'light')
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [preference])

  const setThemePreference = (nextPreference) => {
    if (!THEME_PREFERENCES.includes(nextPreference)) {
      throw new Error(`Unsupported theme preference: ${nextPreference}`)
    }

    if (nextPreference === 'system') {
      setSystemTheme(resolveTheme('system'))
    }

    setPreference(nextPreference)
  }

  return (
    <ThemeContext.Provider
      value={{ preference, resolvedTheme, setThemePreference }}
    >
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)

  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider.')
  }

  return context
}
