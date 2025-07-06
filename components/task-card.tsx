"use client"

import { useState } from "react"
import type { Task } from "../classes/task"
import { TaskType, TaskUrgency, type TaskColor } from "../types/task-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Calendar, Edit, Plus, Trash2, LinkIcon, FileText, ChevronDown, ChevronRight } from "lucide-react"
import { format } from "date-fns"
import { TaskChannel } from "./task-channel"
import { TaskEditMenu } from "./task-edit-menu"
import { CreateTaskForm } from "./create-task-form"
import { useTheme } from "../lib/theme-context"
import { getRandomTaskColor } from "../types/theme-types"

// Add color variation function
const getColorVariation = (baseColor: string, depth: number, isMessage: boolean = false, colors: any) => {
  if (isMessage) {
    // For messages, use a subtle variation of theme colors
    return {
      primary: colors.card + "E6", // Slightly transparent card color
      secondary: colors.background + "CC", // Slightly transparent background
      accent: colors.accent + "60", // Muted accent
      text: colors.foreground + "CC", // Slightly muted text
    }
  }
  
  // For subtasks, create darker/lighter variations based on depth
  const variation = Math.min(depth * 0.15, 0.6) // Max 60% variation
  
  // Simple color manipulation - darken for light mode, lighten for dark mode
  const isLightMode = colors.background.includes("FF") || colors.background.includes("F8") || colors.background.includes("F0")
  
  let modifiedColor = baseColor
  if (isLightMode) {
    // Darken the color for light mode
    modifiedColor = baseColor + Math.floor(variation * 255).toString(16).padStart(2, '0')
  } else {
    // Lighten the color for dark mode
    modifiedColor = baseColor + Math.floor((1 - variation) * 255).toString(16).padStart(2, '0')
  }
  
  return {
    primary: colors.card + "E6",
    secondary: colors.background + "CC", 
    accent: modifiedColor,
    text: colors.foreground + "CC",
  }
}

interface TaskCardProps {
  task: Task
  allCategories: string[]
  onUpdate: (task: Task) => void
  onDelete: (taskId: string) => void
  onAddSubtask: (parentId: string, taskData: {
    name: string
    type: TaskType
    category: string[]
    urgency: TaskUrgency[]
    notes: string
    dueDate: Date | null
    links: string[]
    color: TaskColor
  }) => void
  depth?: number
  taskNumber?: string
  onEdit?: () => void
}

export function TaskCard({ task, allCategories, onUpdate, onDelete, onAddSubtask, depth = 0, taskNumber, onEdit }: TaskCardProps) {
  const { colors, theme } = useTheme()
  const [isExpanded, setIsExpanded] = useState(false)
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(true)
  const [showAddSubtask, setShowAddSubtask] = useState(false)
  const [showEditMenu, setShowEditMenu] = useState(false)

  const handleToggleComplete = () => {
    task.toggleCompletion()
    onUpdate(task)
  }

  const handleCreateSubtask = (taskData: {
    name: string
    type: TaskType
    category: string[]
    urgency: TaskUrgency[]
    notes: string
    dueDate: Date | null
    links: string[]
    color: TaskColor
  }) => {
    onAddSubtask(task.id, taskData)
    setShowAddSubtask(false)
    setIsExpanded(true) // Automatically expand subtasks when a new one is added
  }

  const getUrgencyColor = (urgency: TaskUrgency[]) => {
    if (urgency.includes(TaskUrgency.URGENT)) return "destructive"
    if (urgency.includes(TaskUrgency.IMPORTANT)) return "default"
    return "secondary"
  }

  const getTypeColor = (type: TaskType) => {
    switch (type) {
      case TaskType.LEARN:
        return "bg-blue-200 text-blue-900"
      case TaskType.DISCOVER:
        return "bg-purple-200 text-purple-900"
      case TaskType.DO:
        return "bg-green-200 text-green-900"
      case TaskType.REPEAT:
        return "bg-orange-200 text-orange-900"
      default:
        return "bg-gray-200 text-gray-900"
    }
  }

  const completionPercentage = task.getCompletionPercentage()

  // Use theme-aware colors for task styling
  const taskColor = getRandomTaskColor(theme.theme, theme.mode)
  
  // Generate color variations based on depth
  const colorVariation = getColorVariation(taskColor, depth, false, colors)
  
  // Create distinct color schemes for subtasks and messages sections
  const subtasksColors = {
    background: colors.background + "F0", // Slightly more opaque background
    border: colors.accent + "A0", // Even more visible accent border
    text: colors.foreground, // Full contrast text
    header: colors.accent + "30", // More visible header background
  }
  
  const messagesColors = {
    background: colors.background + "F0", // Same background as subtasks for consistency
    border: taskColor + "A0", // Even more visible task color border
    text: colors.foreground, // Full contrast text
    header: taskColor + "25", // More visible header background
  }
  
  const cardStyle = {
    backgroundColor: depth > 0 ? colorVariation.primary : colors.card,
    borderColor: depth > 0 ? colorVariation.accent : taskColor,
    color: depth > 0 ? colorVariation.text : colors.foreground,
    borderWidth: "3px",
    borderStyle: "solid",
    background: depth > 0 
      ? `linear-gradient(135deg, ${colorVariation.primary} 0%, ${colorVariation.secondary} 100%)`
      : `linear-gradient(135deg, ${colors.card} 0%, ${colors.background} 100%)`,
    boxShadow: depth > 0
      ? `0 6px 20px -6px ${colorVariation.accent}40, 0 3px 10px -3px ${colorVariation.accent}30`
      : `0 8px 25px -8px ${taskColor}40, 0 4px 15px -4px ${taskColor}30`,
  }

  const progressStyle = {
    backgroundColor: depth > 0 ? colorVariation.secondary : colors.background,
    border: `3px solid ${depth > 0 ? colorVariation.accent : taskColor}`,
    boxShadow: `inset 0 2px 4px ${depth > 0 ? colorVariation.accent + "30" : colors.accent + "30"}`,
  }

  const progressFillStyle = {
    background: depth > 0
      ? `linear-gradient(90deg, ${colorVariation.accent} 0%, ${colorVariation.accent}80 100%)`
      : `linear-gradient(90deg, ${taskColor} 0%, ${taskColor}80 100%)`,
    boxShadow: depth > 0
      ? `0 2px 8px ${colorVariation.accent}40`
      : `0 2px 8px ${taskColor}40`,
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
                style={{ borderColor: taskColor, borderWidth: "3px" }}
              />
              {taskNumber && (
                <Badge
                  variant="outline"
                  className="font-mono text-xs"
                  style={{
                    borderColor: taskColor,
                    color: taskColor,
                    backgroundColor: taskColor + "10",
                    minWidth: "24px",
                    height: "20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }}
                >
                  {taskNumber}
                </Badge>
              )}
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
              <Button
                variant="ghost"
                size="sm"
                onClick={onEdit ? onEdit : () => setShowEditMenu(!showEditMenu)}
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
            {task.category.map((cat) => (
              <Badge
                key={cat}
                variant="outline"
                style={{
                  borderColor: taskColor,
                  color: colors.foreground,
                  backgroundColor: colors.card + "40",
                }}
              >
                {cat}
              </Badge>
            ))}
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
          <div className="mt-2" style={{ 
            backgroundColor: subtasksColors.background,
            border: `1px solid ${subtasksColors.border}`,
            borderRadius: "8px",
            padding: "12px",
            marginTop: "16px"
          }}>
            <div className="flex items-center justify-between mb-3" style={{ 
              backgroundColor: subtasksColors.header,
              padding: "8px 12px",
              borderRadius: "6px",
              margin: "-12px -12px 12px -12px"
            }}>
              <div className="flex items-center">
                <h3 className="text-lg font-semibold" style={{ color: subtasksColors.text }}>
                  Subtasks for {task.name}
                </h3>
                <Badge variant="secondary" className="ml-2" style={{ backgroundColor: colors.accent + "30", color: colors.foreground }}>
                  {task.subtasks.length}
                </Badge>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsExpanded(!isExpanded)}
                  style={{ color: colors.foreground }}
                >
                  {isExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  {isExpanded ? "Hide" : "Show"}
                </Button>
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
                  <div className="space-y-2" style={{ padding: "8px 0" }}>
                    {task.subtasks.map((subtask, index) => (
                      <TaskCard
                        key={subtask.id}
                        task={subtask}
                        allCategories={allCategories}
                        onUpdate={onUpdate}
                        onDelete={onDelete}
                        onAddSubtask={onAddSubtask}
                        depth={depth + 1}
                        taskNumber={taskNumber ? `${taskNumber}.${index + 1}` : `${index + 1}`}
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
          <div className="mt-4" style={{ 
            backgroundColor: messagesColors.background,
            border: `1px solid ${messagesColors.border}`,
            borderRadius: "8px",
            padding: "12px",
            marginTop: "16px"
          }}>
            <div style={{ 
              backgroundColor: messagesColors.header,
              padding: "8px 12px",
              borderRadius: "6px",
              margin: "-12px -12px 12px -12px"
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold" style={{ color: messagesColors.text }}>
                    Messages for {task.name}
                  </h3>
                  <Badge variant="secondary" className="ml-2" style={{ backgroundColor: taskColor + "30", color: colors.foreground }}>
                    {task.messages.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsMessagesExpanded(!isMessagesExpanded)}
                  style={{ color: colors.foreground }}
                >
                  {isMessagesExpanded ? <ChevronDown className="h-4 w-4 mr-2" /> : <ChevronRight className="h-4 w-4 mr-2" />}
                  {isMessagesExpanded ? "Hide" : "Show"}
                </Button>
              </div>
            </div>
            {isMessagesExpanded && (
              <TaskChannel task={task} onUpdate={onUpdate} showHeader={false} />
            )}
          </div>

      {onEdit ? null : showEditMenu && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <TaskEditMenu
                task={task}
                categories={allCategories}
                onUpdate={onUpdate}
                onClose={() => setShowEditMenu(false)}
                onAddCategory={() => {}}
              />
            </div>
          )}

          {/* Subtask Creation Popup */}
          {showAddSubtask && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <CreateTaskForm
                categories={task.category}
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
