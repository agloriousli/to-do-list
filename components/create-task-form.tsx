"use client"

import type React from "react"

import { useState } from "react"
import { TaskType, TaskUrgency, type TaskColor } from "../types/task-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, X, Palette } from "lucide-react"
import { ColorPicker } from "./color-picker"
import { useTheme } from "../lib/theme-context"
import { getRandomTaskColor } from "../types/theme-types"

interface CreateTaskFormProps {
  categories: string[]
  onCreateTask: (taskData: {
    name: string
    type: TaskType
    category: string
    urgency: TaskUrgency[]
    notes: string
    dueDate: Date | null
    links: string[]
    color: TaskColor
  }) => void
  onCancel: () => void
}

export function CreateTaskForm({ categories, onCreateTask, onCancel }: CreateTaskFormProps) {
  const { colors, theme } = useTheme()
  const [formData, setFormData] = useState({
    name: "",
    type: TaskType.DO,
    category: categories[0] || "Personal",
    urgency: [TaskUrgency.CASUAL] as TaskUrgency[],
    notes: "",
    dueDate: "",
    links: [""],
    color: {
      primary: getRandomTaskColor(theme.theme, theme.mode),
      secondary: getRandomTaskColor(theme.theme, theme.mode),
      accent: colors.accent,
      text: colors.foreground,
    } as TaskColor,
  })
  const [showColorPicker, setShowColorPicker] = useState(false)

  const handleUrgencyChange = (urgency: TaskUrgency, checked: boolean) => {
    if (checked) {
      setFormData((prev) => ({
        ...prev,
        urgency: [...prev.urgency, urgency],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        urgency: prev.urgency.filter((u) => u !== urgency),
      }))
    }
  }

  const handleAddLink = () => {
    setFormData((prev) => ({
      ...prev,
      links: [...prev.links, ""],
    }))
  }

  const handleRemoveLink = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }))
  }

  const handleLinkChange = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      links: prev.links.map((link, i) => (i === index ? value : link)),
    }))
  }

  const handleColorChange = (color: TaskColor) => {
    setFormData((prev) => ({
      ...prev,
      color,
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    onCreateTask({
      name: formData.name.trim(),
      type: formData.type,
      category: formData.category,
      urgency: formData.urgency,
      notes: formData.notes,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : null,
      links: formData.links.filter((link) => link.trim()),
      color: formData.color,
    })
  }

  const cardStyle = {
    backgroundColor: formData.color.primary,
    borderColor: formData.color.accent,
    borderWidth: "2px",
    borderStyle: "solid",
    background: `linear-gradient(135deg, ${formData.color.primary} 0%, ${formData.color.secondary} 100%)`,
    boxShadow: `0 12px 40px -12px ${formData.color.accent}40, 0 8px 25px -8px ${formData.color.accent}30`,
  }

  return (
    <div className="relative pointer-events-auto">
      <Card className="shadow-lg transition-all duration-300 w-[600px] max-w-[90vw]" style={cardStyle}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
              style={{ color: formData.color.text }}
            >
              <X className="h-4 w-4" />
            </Button>
            <CardTitle style={{ color: formData.color.text }}>Create New Task</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowColorPicker(!showColorPicker)}
              style={{ color: formData.color.text }}
            >
              <Palette className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium" style={{ color: formData.color.text }}>
                Task Name *
              </label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="Enter task name..."
                required
                style={{
                  backgroundColor: colors.card + "CC",
                  borderColor: formData.color.accent,
                  color: formData.color.text,
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium" style={{ color: formData.color.text }}>
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value: TaskType) => setFormData((prev) => ({ ...prev, type: value }))}
                >
                  <SelectTrigger
                    style={{
                      backgroundColor: colors.card + "CC",
                      borderColor: formData.color.accent,
                      color: formData.color.text,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: colors.card, borderColor: colors.accent }}>
                    {Object.values(TaskType).map((type) => (
                      <SelectItem key={type} value={type} style={{ color: colors.foreground }}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium" style={{ color: formData.color.text }}>
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
                >
                  <SelectTrigger
                    style={{
                      backgroundColor: colors.card + "CC",
                      borderColor: formData.color.accent,
                      color: formData.color.text,
                    }}
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent style={{ backgroundColor: colors.card, borderColor: colors.accent }}>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category} style={{ color: colors.foreground }}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: formData.color.text }}>
                Urgency
              </label>
              <div className="flex space-x-4 mt-2">
                {Object.values(TaskUrgency).map((urgency) => (
                  <div key={urgency} className="flex items-center space-x-2">
                    <Checkbox
                      checked={formData.urgency.includes(urgency)}
                      onCheckedChange={(checked) => handleUrgencyChange(urgency, checked as boolean)}
                      style={{ borderColor: formData.color.accent }}
                    />
                    <span className="text-sm" style={{ color: formData.color.text }}>
                      {urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: formData.color.text }}>
                Due Date (Optional)
              </label>
              <Input
                type="datetime-local"
                value={formData.dueDate}
                onChange={(e) => setFormData((prev) => ({ ...prev, dueDate: e.target.value }))}
                style={{
                  backgroundColor: colors.card + "CC",
                  borderColor: formData.color.accent,
                  color: formData.color.text,
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: formData.color.text }}>
                Notes
              </label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any additional notes..."
                rows={3}
                style={{
                  backgroundColor: colors.card + "CC",
                  borderColor: formData.color.accent,
                  color: formData.color.text,
                }}
              />
            </div>

            <div>
              <label className="text-sm font-medium" style={{ color: formData.color.text }}>
                Links
              </label>
              <div className="space-y-2">
                {formData.links.map((link, index) => (
                  <div key={index} className="flex space-x-2">
                    <Input
                      value={link}
                      onChange={(e) => handleLinkChange(index, e.target.value)}
                      placeholder="Enter URL..."
                      style={{
                        backgroundColor: colors.card + "CC",
                        borderColor: formData.color.accent,
                        color: formData.color.text,
                      }}
                    />
                    {formData.links.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveLink(index)}
                        style={{ color: formData.color.text }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleAddLink}
                  className="w-full"
                  style={{ color: formData.color.text }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>

            <div className="flex space-x-2 pt-4">
              <Button
                type="submit"
                className="flex-1 transition-all duration-300 hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${formData.color.accent} 0%, ${formData.color.accent}80 100%)`,
                  color: colors.card,
                  boxShadow: `0 6px 20px -4px ${formData.color.accent}50, 0 4px 12px -2px ${formData.color.accent}40`,
                }}
              >
                Create Task
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {showColorPicker && (
        <div className="absolute top-0 right-0 z-10">
          <ColorPicker
            currentColor={formData.color}
            onColorChange={handleColorChange}
            onClose={() => setShowColorPicker(false)}
          />
        </div>
      )}
    </div>
  )
}
