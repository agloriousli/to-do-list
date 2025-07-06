"use client"

import { useState } from "react"
import { useTheme } from "../lib/theme-context"
import { THEMES, type ThemeName, FONT_OPTIONS } from "../types/theme-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Palette, Sun, Moon, Check, Type } from "lucide-react"

export function ThemeSelector() {
  const { theme, toggleMode, setThemeName, setFont, colors } = useTheme()
  const [isThemeOpen, setIsThemeOpen] = useState(false)
  const [isFontOpen, setIsFontOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleThemeSelect = (themeName: ThemeName) => {
    setThemeName(themeName)
    setIsThemeOpen(false)
  }

  const handleFontSelect = (fontValue: string) => {
    setFont(fontValue)
    setIsFontOpen(false)
  }

  const currentTheme = THEMES.find(t => t.name === theme.theme)

  return (
    <Card 
      className="mb-4" 
      style={{ 
        backgroundColor: colors.card,
        borderColor: colors.accent + "20"
      }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center" style={{ color: colors.foreground }}>
            <Palette className="h-5 w-5 mr-2" />
            Theme Settings
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ color: colors.foreground }}
          >
            {isExpanded ? "−" : "+"}
          </Button>
        </div>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
        {/* Mode Toggle - At the top */}
        <div className="flex items-center justify-between">
          <span className="text-sm" style={{ color: colors.foreground }}>
            Mode
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={toggleMode}
            style={{ 
              borderColor: colors.accent,
              color: colors.foreground,
              backgroundColor: colors.background
            }}
          >
            {theme.mode === "light" ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                Light
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                Dark
              </>
            )}
          </Button>
        </div>

        {/* Theme Selection */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: colors.foreground }}>
              Choose Theme
            </span>
            <DropdownMenu open={isThemeOpen} onOpenChange={setIsThemeOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="text-xs px-2 py-1 h-7"
                  style={{ 
                    borderColor: colors.accent,
                    color: colors.foreground,
                    backgroundColor: colors.background
                  }}
                >
                  <Palette className="h-3 w-3 mr-1" />
                  {currentTheme?.displayName}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                style={{ backgroundColor: colors.card, borderColor: colors.accent }}
              >
                {THEMES.map((themeOption) => (
                  <DropdownMenuItem
                    key={themeOption.name}
                    onClick={() => handleThemeSelect(themeOption.name)}
                    style={{ color: colors.foreground }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: themeOption.light.accent }}
                      />
                      <span>{themeOption.displayName}</span>
                    </div>
                    {theme.theme === themeOption.name && (
                      <Check className="h-4 w-4" style={{ color: colors.accent }} />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Theme Preview - 3 dots */}
        <div 
          className="h-16 rounded-lg border-2 transition-all duration-300"
          style={{
            background: `linear-gradient(135deg, ${colors.background} 0%, ${colors.accent}20 100%)`,
            borderColor: colors.accent,
          }}
        >
          <div className="h-full flex items-center justify-center">
            <div className="flex space-x-2">
              {colors.taskSubcolors.slice(0, 3).map((color, index) => (
                <div
                  key={index}
                  className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: colors.foreground }}>
              Font
            </span>
            <DropdownMenu open={isFontOpen} onOpenChange={setIsFontOpen}>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  style={{ 
                    borderColor: colors.accent,
                    color: colors.foreground,
                    backgroundColor: colors.background
                  }}
                >
                  <Type className="h-4 w-4 mr-2" />
                  <span className={`font-${theme.font.toLowerCase().replace(/\s+/g, '-')}`}>
                    {theme.font}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="end"
                style={{ backgroundColor: colors.card, borderColor: colors.accent }}
                className="min-w-[200px]"
              >
                {FONT_OPTIONS.map((fontOption) => (
                  <DropdownMenuItem
                    key={fontOption.value}
                    onClick={() => handleFontSelect(fontOption.value)}
                    style={{ color: colors.foreground }}
                    className="flex items-center justify-between py-2"
                  >
                    <span 
                      className={`text-sm font-${fontOption.value.toLowerCase().replace(/\s+/g, '-')}`}
                    >
                      {fontOption.displayName}
                    </span>
                    {theme.font === fontOption.value && (
                      <Check className="h-4 w-4" style={{ color: colors.accent }} />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
      )}
    </Card>
  )
} 