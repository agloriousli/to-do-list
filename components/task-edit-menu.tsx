"use client"

import { useState } from "react"
import type { Task } from "../classes/task"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Edit, Save, X } from "lucide-react"
import { format } from "date-fns"
import { useTheme } from "../lib/theme-context"

interface TaskEditMenuProps {
  task: Task
  onUpdate: (task: Task) => void
  onClose: () => void
}

export function TaskEditMenu({ task, onUpdate, onClose }: TaskEditMenuProps) {
  const { colors } = useTheme()
  const [editedTask, setEditedTask] = useState({ ...task })

  const handleSave = () => {
    task.updateTask(editedTask)
    onUpdate(task)
    onClose()
  }

  const handleCancel = () => {
    setEditedTask({ ...task })
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
