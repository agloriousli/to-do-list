"use client"

import { useState, useEffect, useRef } from "react"
import type { TaskColor } from "../types/task-types"
import { PASTEL_COLORS, DEFAULT_TASK_COLOR } from "../types/task-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Palette, Check, RotateCcw } from "lucide-react"
import { useTheme } from "../lib/theme-context"

interface ColorPickerProps {
  currentColor: TaskColor
  onColorChange: (color: TaskColor) => void
  onClose: () => void
}

export function ColorPicker({ currentColor, onColorChange, onClose }: ColorPickerProps) {
  const { colors } = useTheme()
  const [customColor, setCustomColor] = useState<TaskColor>(currentColor)
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const colorPickerRef = useRef<HTMLDivElement>(null)

  // Add click-away listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (colorPickerRef.current && !colorPickerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const handlePresetSelect = (colors: TaskColor, name: string) => {
    setSelectedPreset(name)
    onColorChange(colors)
  }

  const handleCustomColorChange = (field: keyof TaskColor, value: string) => {
    const newColor = { ...customColor, [field]: value }
    setCustomColor(newColor)
    onColorChange(newColor)
  }

  const resetToDefault = () => {
    setCustomColor(DEFAULT_TASK_COLOR)
    setSelectedPreset(null)
    onColorChange(DEFAULT_TASK_COLOR)
  }

  const isValidHex = (hex: string) => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
  }

  return (
    <Card 
      ref={colorPickerRef} 
      className="w-96 max-h-96 overflow-y-auto shadow-xl transition-all duration-300"
      style={{ 
        backgroundColor: colors.card,
        borderColor: colors.accent + "20"
      }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center" style={{ color: colors.foreground }}>
            <Palette className="h-5 w-5 mr-2" />
            Choose Color Theme
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={resetToDefault}
              style={{ color: colors.foreground }}
            >
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onClose}
              style={{ color: colors.foreground }}
            >
              ✕
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="presets" className="w-full">
          <TabsList 
            className="grid w-full grid-cols-2"
            style={{ backgroundColor: colors.background }}
          >
            <TabsTrigger 
              value="presets"
              style={{ color: colors.foreground }}
            >
              Presets
            </TabsTrigger>
            <TabsTrigger 
              value="custom"
              style={{ color: colors.foreground }}
            >
              Custom
            </TabsTrigger>
          </TabsList>

          <TabsContent value="presets" className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              {PASTEL_COLORS.map((preset) => (
                <div
                  key={preset.name}
                  className="relative cursor-pointer rounded-lg border-2 hover:border-gray-400 transition-colors"
                  style={{
                    borderColor: selectedPreset === preset.name ? preset.colors.accent : colors.accent + "40",
                  }}
                  onClick={() => handlePresetSelect(preset.colors, preset.name)}
                >
                  <div
                    className="h-16 rounded-t-md"
                    style={{
                      background: `linear-gradient(135deg, ${preset.colors.primary} 0%, ${preset.colors.secondary} 50%, ${preset.colors.accent} 100%)`,
                    }}
                  />
                  <div className="p-2">
                    <p className="text-xs font-medium text-center" style={{ color: preset.colors.text }}>
                      {preset.name}
                    </p>
                  </div>
                  {selectedPreset === preset.name && (
                    <div className="absolute top-1 right-1 bg-white rounded-full p-1">
                      <Check className="h-3 w-3 text-green-600" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-3">
              <div>
                <Label htmlFor="primary" style={{ color: colors.foreground }}>Primary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="primary"
                    value={customColor.primary}
                    onChange={(e) => handleCustomColorChange("primary", e.target.value)}
                    placeholder="#FFFFFF"
                    className={`flex-1 ${!isValidHex(customColor.primary) ? "border-red-500" : ""}`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "40",
                      color: colors.foreground,
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ 
                      backgroundColor: isValidHex(customColor.primary) ? customColor.primary : "#FFFFFF",
                      borderColor: colors.accent + "40"
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondary" style={{ color: colors.foreground }}>Secondary Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="secondary"
                    value={customColor.secondary}
                    onChange={(e) => handleCustomColorChange("secondary", e.target.value)}
                    placeholder="#F3F4F6"
                    className={`flex-1 ${!isValidHex(customColor.secondary) ? "border-red-500" : ""}`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "40",
                      color: colors.foreground,
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ 
                      backgroundColor: isValidHex(customColor.secondary) ? customColor.secondary : "#F3F4F6",
                      borderColor: colors.accent + "40"
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accent" style={{ color: colors.foreground }}>Accent Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="accent"
                    value={customColor.accent}
                    onChange={(e) => handleCustomColorChange("accent", e.target.value)}
                    placeholder="#6B7280"
                    className={`flex-1 ${!isValidHex(customColor.accent) ? "border-red-500" : ""}`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "40",
                      color: colors.foreground,
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ 
                      backgroundColor: isValidHex(customColor.accent) ? customColor.accent : "#6B7280",
                      borderColor: colors.accent + "40"
                    }}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="text" style={{ color: colors.foreground }}>Text Color</Label>
                <div className="flex space-x-2">
                  <Input
                    id="text"
                    value={customColor.text}
                    onChange={(e) => handleCustomColorChange("text", e.target.value)}
                    placeholder="#1F2937"
                    className={`flex-1 ${!isValidHex(customColor.text) ? "border-red-500" : ""}`}
                    style={{
                      backgroundColor: colors.background,
                      borderColor: colors.accent + "40",
                      color: colors.foreground,
                    }}
                  />
                  <div
                    className="w-10 h-10 rounded border"
                    style={{ 
                      backgroundColor: isValidHex(customColor.text) ? customColor.text : "#1F2937",
                      borderColor: colors.accent + "40"
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-4">
              <Label style={{ color: colors.foreground }}>Preview</Label>
              <div
                className="mt-2 p-4 rounded-lg border"
                style={{
                  backgroundColor: customColor.primary,
                  borderColor: customColor.accent,
                  color: customColor.text,
                }}
              >
                <div className="flex items-center space-x-2">
                  <Badge style={{ backgroundColor: customColor.accent, color: "white" }}>Sample Task</Badge>
                  <span className="text-sm">This is how your task will look</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
