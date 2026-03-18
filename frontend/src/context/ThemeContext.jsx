import React, { createContext, useState, useEffect } from 'react'

export const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState('dark')
  const [mounted, setMounted] = useState(false)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('campusconnect-theme') || 'dark'
    setTheme(savedTheme)

    // Apply theme to document
    const htmlElement = document.documentElement
    if (savedTheme === 'light') {
      htmlElement.classList.remove('dark')
    } else {
      htmlElement.classList.add('dark')
    }

    setMounted(true)
  }, [])

  // Update theme and localStorage
  const toggleTheme = () => {
    setTheme((prev) => {
      const newTheme = prev === 'dark' ? 'light' : 'dark'
      localStorage.setItem('campusconnect-theme', newTheme)

      // Update document class for Tailwind
      const htmlElement = document.documentElement
      if (newTheme === 'light') {
        htmlElement.classList.remove('dark')
      } else {
        htmlElement.classList.add('dark')
      }

      return newTheme
    })
  }

  // Prevent flash of unstyled content
  if (!mounted) {
    return children
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
