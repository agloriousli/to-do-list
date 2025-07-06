"use client"

import { useState } from "react"
import type { Task } from "../classes/task"
import { TaskType, TaskUrgency, type TaskColor } from "../types/task-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Edit, Plus, Trash2, LinkIcon, FileText, ChevronDown, ChevronRight, MessageSquare } from "lucide-react"
import { format } from "date-fns"
import { TaskChannel } from "./task-channel"
import { TaskEditMenu } from "./task-edit-menu"
import { CreateTaskForm } from "./create-task-form"
import { useTheme } from "../lib/theme-context"
import { getRandomTaskColor } from "../types/theme-types"

interface TaskCardProps {
  task: Task
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onAddSubtask: (parentId: string, taskData: {
    name: string
    type: TaskType
    category: string
    urgency: TaskUrgency[]
    notes: string
    dueDate: Date | null
    links: string[]
    color: TaskColor
  }) => void
  depth?: number
}

export function TaskCard({ task, onUpdate, onDelete, onAddSubtask, depth = 0 }: TaskCardProps) {
  const { colors, theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)

  const handleToggleComplete = () => {
    task.toggleCompletion()
    onUpdate(task)
  }

  const handleCreateSubtask = (taskData: {
    name: string
    type: TaskType
    category: string
    urgency: TaskUrgency[]
    notes: string
    dueDate: Date | null
    links: string[]
    color: TaskColor
  }) => {
    onAddSubtask(task.id, taskData)
    setShowAddSubtask(false)
  }

  const getUrgencyColor = (urgency: TaskUrgency[]) => {
    if (urgency.includes(TaskUrgency.URGENT)) return "destructive"
    if (urgency.includes(TaskUrgency.IMPORTANT)) return "default"
    return "secondary"
  }

  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case TaskType.LEARN:
        return "bg-blue-100 text-blue-800"
      case TaskType.DISCOVER:
        return "bg-purple-100 text-purple-800"
      case TaskType.DO:
        return "bg-green-100 text-green-800"
      case TaskType.REPEAT:
        return "bg-orange-100 text-orange-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const completionPercentage = task.getCompletionPercentage()

  // Use theme-aware colors for task styling
  const taskColor = getRandomTaskColor(theme.theme, theme.mode)
  const cardStyle = {
    backgroundColor: colors.card,
    borderColor: taskColor,
    color: colors.foreground,
    borderWidth: "2px",
    borderStyle: "solid",
    background: `linear-gradient(135deg, ${colors.card} 0%, ${colors.background} 100%)`,
    boxShadow: `0 8px 25px -8px ${taskColor}30, 0 4px 15px -4px ${taskColor}20`,
  }

  const progressStyle = {
    backgroundColor: colors.background,
    border: `1px solid ${taskColor}`,
    boxShadow: `inset 0 2px 4px ${colors.accent}10`,
  }

  const progressFillStyle = {
    background: `linear-gradient(90deg, ${taskColor} 0%, ${taskColor}80 100%)`,
    boxShadow: `0 2px 8px ${taskColor}40`,
  }

  return (
    <div className="relative">
      <Card
        className={`mb-4 ${depth > 0 ? "ml-6" : ""} shadow-lg transition-all duration-200 hover:shadow-xl`}
        style={cardStyle}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-2 flex-1">
              <Checkbox
                checked={task.isCompleted}
                onCheckedChange={handleToggleComplete}
                className="border-2"
                style={{ borderColor: taskColor }}
              />
              {task.subtasks.length > 0 && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ color: colors.foreground }}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </Button>
              )}
              <div className="flex-1">
                <CardTitle
                  className={`text-lg ${task.isCompleted ? "line-through opacity-60" : ""}`}
                  style={{ color: colors.foreground }}
                >
                  {task.name}
                </CardTitle>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {task.messages.length > 0 && (
                <Badge 
                  variant="secondary" 
                  className="ml-1 text-xs"
                  style={{
                    backgroundColor: taskColor,
                    color: "white",
                    fontSize: "10px",
                    padding: "2px 4px",
                    minWidth: "16px",
                    height: "16px"
                  }}
                >
                  {task.messages.length}
                </Badge>
              )}

              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowEditMenu(!showEditMenu)}
                style={{ color: colors.foreground }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onDelete(task.id)} 
                style={{ color: colors.foreground }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mt-2">
            <Badge
              className={getTypeColor(task.type)}
              style={{
                backgroundColor: taskColor,
                color: "white",
                border: "none",
              }}
            >
              {task.type}
            </Badge>
            <Badge
              variant="outline"
              style={{
                borderColor: taskColor,
                color: colors.foreground,
                backgroundColor: colors.card + "40",
              }}
            >
              {task.category}
            </Badge>
            {task.urgency.map((urgency) => (
              <Badge
                key={urgency}
                variant={getUrgencyColor(task.urgency)}
                style={{
                  backgroundColor:
                    urgency === TaskUrgency.URGENT
                      ? "#ef4444"
                      : urgency === TaskUrgency.IMPORTANT
                        ? taskColor
                        : colors.background,
                  color:
                    urgency === TaskUrgency.URGENT
                      ? "white"
                      : urgency === TaskUrgency.IMPORTANT
                        ? "white"
                        : colors.foreground,
                  border: "none",
                }}
              >
                {urgency}
              </Badge>
            ))}
          </div>

          <div className="mt-3">
            <div className="flex items-center justify-between text-sm mb-2" style={{ color: colors.foreground }}>
              <span>Progress</span>
              <span>{completionPercentage}%</span>
            </div>
            <div className="w-full rounded-full h-6" style={progressStyle}>
              <div
                className="h-6 rounded-full transition-all duration-300"
                style={{
                  ...progressFillStyle,
                  width: `${completionPercentage}%`,
                }}
              />
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {task.notes && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-1">
                <FileText className="h-4 w-4" style={{ color: colors.foreground }} />
                <span className="text-sm font-medium" style={{ color: colors.foreground }}>
                  Notes
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.foreground + "CC" }}>
                {task.notes}
              </p>
            </div>
          )}

          {task.dueDate && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-1">
                <Calendar className="h-4 w-4" style={{ color: colors.foreground }} />
                <span className="text-sm font-medium" style={{ color: colors.foreground }}>
                  Due Date
                </span>
              </div>
              <p className="text-sm" style={{ color: colors.foreground + "CC" }}>
                {format(task.dueDate, "PPP 'at' p")}
              </p>
            </div>
          )}

          {task.links.length > 0 && (
            <div className="mb-3">
              <div className="flex items-center space-x-1 mb-1">
                <LinkIcon className="h-4 w-4" style={{ color: colors.foreground }} />
                <span className="text-sm font-medium" style={{ color: colors.foreground }}>
                  Links
                </span>
              </div>
              <div className="space-y-1">
                {task.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-sm hover:underline transition-all duration-200"
                    style={{ color: taskColor }}
                  >
                    {link.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Subtasks Section - Header always visible */}
          <div className="mt-4">
            <div className="border-t mb-4" style={{ borderColor: colors.accent + "20" }}></div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <h3 className="text-lg font-semibold" style={{ color: colors.foreground }}>
                  Subtasks for {task.name}
                </h3>
                <Badge variant="secondary" className="ml-2" style={{ backgroundColor: colors.accent + "20", color: colors.foreground }}>
                  {task.subtasks.length}
                </Badge>
              </div>
              <div className="flex space-x-2">
                {task.subtasks.length > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsExpanded(!isExpanded)}
                    style={{ color: colors.foreground }}
                  >
                    {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                    {isExpanded ? "Hide" : "Show"}
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAddSubtask(true)}
                  style={{ color: colors.foreground }}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Subtask
                </Button>
              </div>
            </div>

            {isExpanded && (
              <>
                {task.subtasks.length > 0 ? (
                  <div className="space-y-2">
                    {task.subtasks.map((subtask) => (
                      <TaskCard
                        key={subtask.id}
                        task={subtask}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onAddSubtask={onAddSubtask}
                        depth={depth + 1}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-sm" style={{ color: colors.foreground + "80" }}>
                    No subtasks yet. Click "Add Subtask" to create one.
                  </div>
                )}
              </>
            )}
          </div>

          {/* Task Channel */}
          <div className="mt-4">
            <TaskChannel task={task} onUpdate={onUpdate} />
          </div>

          {showEditMenu && (
            <TaskEditMenu
              task={task}
              onUpdate={onUpdate}
              onClose={() => setShowEditMenu(false)}
            />
          )}

          {/* Subtask Creation Popup */}
          {showAddSubtask && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <CreateTaskForm
                categories={[task.category]}
                onCreateTask={handleCreateSubtask}
                onCancel={() => setShowAddSubtask(false)}
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
