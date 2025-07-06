"use client"

import { useState } from "react"
import type { Task } from "../classes/task"
import { TaskUrgency } from "../types/task-types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Edit, Save, X, Plus } from "lucide-react"
import { format } from "date-fns"
import { useTheme } from "../lib/theme-context"

interface TaskEditMenuProps {
  task: Task
  categories: string[]
  onUpdate: (task: Task) => void
  onClose: () => void
  onAddCategory: (category: string) => void
}

export function TaskEditMenu({ task, categories, onUpdate, onClose, onAddCategory }: TaskEditMenuProps) {
  const { colors } = useTheme()
  const [editedTask, setEditedTask] = useState({ ...task })
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")

  const handleUrgencyChange = (urgency: TaskUrgency, checked: boolean) => {
    if (checked) {
      setEditedTask((prev) => ({
        ...prev,
        urgency: [...prev.urgency, urgency],
      }))
    } else {
      setEditedTask((prev) => ({
        ...prev,
        urgency: prev.urgency.filter((u) => u !== urgency),
      }))
    }
  }

  const handleCategoryChange = (category: string, checked: boolean) => {
    if (checked) {
      setEditedTask((prev) => ({
        ...prev,
        category: [...prev.category, category],
      }))
    } else {
      setEditedTask((prev) => ({
        ...prev,
        category: prev.category.filter((c) => c !== category),
      }))
    }
  }

  const handleSave = () => {
    task.updateTask(editedTask)
    onUpdate(task)
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div className="pointer-events-auto">
        <Card className="w-96 max-h-[80vh] overflow-y-auto shadow-xl" style={{ backgroundColor: colors.card }}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center" style={{ color: colors.foreground }}>
            <Edit className="h-5 w-5 mr-2" />
            Edit Task
          </CardTitle>
              <Button variant="ghost" size="sm" onClick={onClose} style={{ color: colors.foreground }}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
            <div className="space-y-4">
            <div>
                <Label htmlFor="task-name" style={{ color: colors.foreground }}>Task Name</Label>
              <Input
                id="task-name"
                value={editedTask.name}
                onChange={(e) => setEditedTask({ ...editedTask, name: e.target.value })}
                className="mt-1"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent,
                    color: colors.foreground,
                  }}
              />
            </div>

            <div>
                <Label htmlFor="task-notes" style={{ color: colors.foreground }}>Notes</Label>
              <Textarea
                id="task-notes"
                value={editedTask.notes}
                onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                placeholder="Add notes..."
                rows={3}
                className="mt-1"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent,
                    color: colors.foreground,
                  }}
              />
            </div>

            <div>
                <Label htmlFor="due-date" style={{ color: colors.foreground }}>Due Date</Label>
              <Input
                id="due-date"
                type="datetime-local"
                value={editedTask.dueDate ? format(editedTask.dueDate, "yyyy-MM-dd'T'HH:mm") : ""}
                onChange={(e) =>
                  setEditedTask({
                    ...editedTask,
                    dueDate: e.target.value ? new Date(e.target.value) : null,
                  })
                }
                className="mt-1"
                  style={{
                    backgroundColor: colors.background,
                    borderColor: colors.accent,
                    color: colors.foreground,
                  }}
              />
            </div>

            <div>
              <Label style={{ color: colors.foreground }}>Urgency</Label>
              <div className="flex space-x-4 mt-2">
                {Object.values(TaskUrgency).map((urgency) => (
                  <div key={urgency} className="flex items-center space-x-2">
                    <Checkbox
                      checked={editedTask.urgency.includes(urgency)}
                      onCheckedChange={(checked) => handleUrgencyChange(urgency, checked as boolean)}
                      style={{ borderColor: colors.accent }}
                    />
                    <span className="text-sm" style={{ color: colors.foreground }}>
                      {urgency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label style={{ color: colors.foreground }}>Categories</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {categories.map((category) => (
                  <div key={category} className="flex items-center space-x-2">
                    <Checkbox
                      checked={editedTask.category.includes(category)}
                      onCheckedChange={(checked) => handleCategoryChange(category, checked as boolean)}
                      style={{ borderColor: colors.accent }}
                    />
                    <span className="text-sm" style={{ color: colors.foreground }}>
                      {category}
                    </span>
                  </div>
                ))}
              </div>
              {showAddCategory ? (
                <div className="flex items-center space-x-2 mt-2">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category..."
                    style={{ backgroundColor: colors.background, borderColor: colors.accent, color: colors.foreground }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={() => {
                      if (newCategory.trim()) {
                        onAddCategory(newCategory.trim())
                        setEditedTask((prev) => ({ ...prev, category: [...prev.category, newCategory.trim()] }))
                        setNewCategory("")
                        setShowAddCategory(false)
                      }
                    }}
                    style={{ backgroundColor: colors.accent, color: colors.card }}
                  >
                    Add
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddCategory(false)
                      setNewCategory("")
                    }}
                    style={{ color: colors.foreground }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-2"
                  onClick={() => setShowAddCategory(true)}
                  style={{ color: colors.foreground }}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Category
                </Button>
              )}
            </div>

            <div className="flex space-x-2 pt-4">
                <Button onClick={handleSave} className="w-full" style={{ backgroundColor: colors.accent, color: colors.card }}>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
            </div>
          </CardContent>
        </Card>
                  </div>
                </div>
  )
}
