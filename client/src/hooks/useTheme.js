import { useEffect, useState } from 'react'

const KEY = 'finance-theme'

export function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(KEY) ?? 'light')

  useEffect(() => {
    document.body.classList.toggle('dark', theme === 'dark')
    localStorage.setItem(KEY, theme)
  }, [theme])

  return {
    theme,
    toggleTheme: () => setTheme((prev) => (prev === 'dark' ? 'light' : 'dark')),
  }
}
