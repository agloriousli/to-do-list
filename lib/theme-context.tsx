"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import type { AppTheme, ThemeName } from "../types/theme-types"
import { getThemeColors } from "../types/theme-types"

interface ThemeContextType {
  theme: AppTheme
  setTheme: (theme: AppTheme) => void
  toggleMode: () => void
  setThemeName: (name: ThemeName) => void
  setFont: (font: string) => void
  colors: ReturnType<typeof getThemeColors>
  isHydrated: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>(() => {
    // Default theme for SSR
    return { mode: "light", theme: "black-white", font: "Inter" }
  })
  const [isHydrated, setIsHydrated] = useState(false)

  const colors = getThemeColors(theme.theme, theme.mode)

  // Load theme from localStorage after hydration
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("app-theme")
      if (saved) {
        try {
          const parsedTheme = JSON.parse(saved)
          setThemeState(parsedTheme)
        } catch {
          // fallback to default
        }
      }
      setIsHydrated(true)
    }
  }, [])

  const setTheme = (newTheme: AppTheme) => {
    setThemeState(newTheme)
    if (typeof window !== "undefined") {
      localStorage.setItem("app-theme", JSON.stringify(newTheme))
    }
  }

  const toggleMode = () => {
    setTheme({
      ...theme,
      mode: theme.mode === "light" ? "dark" : "light",
    })
  }

  const setThemeName = (name: ThemeName) => {
    setTheme({
      ...theme,
      theme: name,
    })
  }

  const setFont = (font: string) => {
    setTheme({
      ...theme,
      font: font,
    })
  }

  // Apply theme to document only after hydration
  useEffect(() => {
    if (!isHydrated) return
    
    const root = document.documentElement
    root.style.setProperty("--background", colors.background)
    root.style.setProperty("--foreground", colors.foreground)
    root.style.setProperty("--accent", colors.accent)
    root.style.setProperty("--card", colors.card)
    root.style.setProperty("--task-subcolors", colors.taskSubcolors.join(","))
    
    // Set font family using CSS variable format
    const fontVariable = `var(--font-${theme.font.toLowerCase().replace(/\s+/g, '-')})`
    root.style.setProperty("--font-family", fontVariable)
    
    // Set data attributes for theme-aware styling
    root.setAttribute("data-theme", theme.theme)
    root.setAttribute("data-mode", theme.mode)
    root.setAttribute("data-font", theme.font)
  }, [theme, colors, isHydrated])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleMode, setThemeName, setFont, colors, isHydrated }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
} 