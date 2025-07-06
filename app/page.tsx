"use client"

import { useState, useEffect, useRef } from "react"
import { TaskManager } from "../classes/task-manager"
import type { Task } from "../classes/task"
import { type TaskType, TaskUrgency, type TaskColor } from "../types/task-types"
import { TaskCard } from "../components/task-card"
import { TaskSidebar } from "../components/task-sidebar"
import { CreateTaskForm } from "../components/create-task-form"

import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { CategoryTabs } from "../components/category-tabs"
import { useTheme } from "../lib/theme-context"
import { getRandomTaskColor } from "../types/theme-types"
import { Card, CardContent } from "@/components/ui/card"

export default function TodoApp() {
  const { colors, theme, isHydrated } = useTheme()
  const [taskManager] = useState(() => TaskManager.getInstance())
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [taskFilter, setTaskFilter] = useState<"all" | "incomplete" | "complete">("all")

  useEffect(() => {
    if (isHydrated) {
      refreshTasks()
    }
  }, [isHydrated])

  useEffect(() => {
    if (isHydrated) {
      filterTasks()
    }
  }, [tasks, selectedCategory, searchQuery, taskFilter, isHydrated])

  const refreshTasks = () => {
    const allTasks = taskManager.getAllTasks()
    setTasks([...allTasks])
  }

  const filterTasks = () => {
    let filtered = [...tasks]

    if (selectedCategory) {
      filtered = filtered.filter((task) => task.category === selectedCategory)
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      if (query === "urgent") {
        filtered = filtered.filter((task) => task.urgency.includes(TaskUrgency.URGENT))
      } else if (query === "completed") {
        filtered = filtered.filter((task) => task.isCompleted)
      } else if (query === "overdue") {
        const now = new Date()
        filtered = filtered.filter((task) => task.dueDate && task.dueDate < now && !task.isCompleted)
      } else {
        filtered = taskManager.searchTasks(query)
        if (selectedCategory) {
          filtered = filtered.filter((task) => task.category === selectedCategory)
        }
      }
    }

    // Apply task filter
    if (taskFilter === "incomplete") {
      filtered = filtered.filter((task) => !task.isCompleted)
    } else if (taskFilter === "complete") {
      filtered = filtered.filter((task) => task.isCompleted)
    }

    // Sort completed tasks to the bottom
    filtered.sort((a, b) => {
      if (a.isCompleted && !b.isCompleted) return 1
      if (!a.isCompleted && b.isCompleted) return -1
      return 0
    })

    setFilteredTasks(filtered)
  }

  const handleCreateTask = (taskData: {
    name: string
    type: TaskType
    category: string
    urgency: TaskUrgency[]
    notes: string
    dueDate: Date | null
    links: string[]
    color: TaskColor
  }) => {
    // Use theme-aware colors for new tasks
    const taskColor = getRandomTaskColor(theme.theme, theme.mode)
    const task = taskManager.createTask(
      taskData.name,
      taskData.type,
      taskData.category,
      taskData.urgency,
      taskData.dueDate,
      {
        primary: taskColor,
        secondary: taskColor,
        accent: colors.accent,
        text: colors.foreground,
      },
    )

    task.notes = taskData.notes
    taskData.links.forEach((url) => {
      if (url.trim()) {
        task.addLink(url.trim(), url.trim())
      }
    })

    refreshTasks()
    setShowCreateForm(false)
  }

  const handleUpdateTask = () => {
    refreshTasks()
  }

  const handleDeleteTask = (taskId: string) => {
    taskManager.deleteTask(taskId)
    refreshTasks()
  }

  const handleAddSubtask = (parentId: string, taskData: {
    name: string
    type: TaskType
    category: string
    urgency: TaskUrgency[]
    notes: string
    dueDate: Date | null
    links: string[]
    color: TaskColor
  }) => {
    const subtask = taskManager.createSubtask(
      parentId, 
      taskData.name, 
      taskData.type, 
      taskData.category, 
      taskData.urgency, 
      taskData.dueDate, 
      taskData.color
    )
    if (subtask) {
      subtask.notes = taskData.notes
      taskData.links.forEach((url) => {
        if (url.trim()) {
          subtask.addLink(url.trim(), url.trim())
        }
      })
    }
    refreshTasks()
  }

  const handleColorUpdate = (taskId: string, color: TaskColor) => {
    taskManager.updateTaskColor(taskId, color)
    refreshTasks()
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
  }

  const handleCategorySelect = (category: string | null) => {
    setSelectedCategory(category)
  }

  const getTaskCounts = () => {
    const counts: { [key: string]: number } = {}
    if (taskManager) {
      taskManager.getCategories().forEach((category) => {
        counts[category] = taskManager.getTasksByCategory(category).length
      })
    }
    return counts
  }

  const taskCounts = getTaskCounts()

  // Show loading state until hydrated
  if (!isHydrated) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="flex h-screen transition-all duration-300"
      style={{ backgroundColor: colors.background }}
    >
      {/* Title Bar */}
      <div 
        className="fixed top-0 left-0 right-0 z-10 h-16 flex items-center justify-center shadow-sm"
        style={{ 
          backgroundColor: colors.card,
          borderBottom: `1px solid ${colors.accent}20`
        }}
      >
        <h1 
          className="text-2xl font-bold transition-all duration-300"
          style={{ color: colors.foreground }}
        >
          To-Do List
        </h1>
      </div>

      <TaskSidebar
        taskManager={taskManager}
        selectedCategory={selectedCategory}
        onCategorySelect={handleCategorySelect}
        onSearch={handleSearch}
      />

      <div className="flex-1 overflow-y-auto">
        {/* Add padding to prevent shadow clipping and account for title bar */}
        <div className="p-6" style={{ paddingTop: "88px" }}>
          <CategoryTabs
            categories={taskManager.getCategories()}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
            onAddCategory={(category) => {
              taskManager.addCategory(category)
              refreshTasks()
            }}
            taskCounts={taskCounts}
            totalTasks={tasks.length}
          />

          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 
                className="text-3xl font-bold transition-all duration-300"
                style={{ color: colors.foreground }}
              >
                {selectedCategory ? `${selectedCategory} Tasks` : "All Tasks"}
              </h1>
              <p 
                className="mt-1 transition-all duration-300"
                style={{ color: colors.foreground + "80" }}
              >
                {filteredTasks.length} task{filteredTasks.length !== 1 ? "s" : ""}
                {searchQuery ? ` matching "${searchQuery}"` : ""}
              </p>
            </div>
            <Button
              onClick={() => setShowCreateForm(true)}
              className="transition-all duration-300 hover:scale-105"
              style={{
                background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                color: colors.card,
                boxShadow: `0 8px 30px -8px ${colors.accent}40, 0 4px 16px -4px ${colors.accent}30`,
              }}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Task
            </Button>
          </div>

          {/* Task Filter */}
          <div className="flex space-x-2 mb-6">
            <Button
              variant={taskFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setTaskFilter("all")}
              className="transition-all duration-300 hover:scale-105"
              style={
                taskFilter === "all"
                  ? {
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                      color: colors.card,
                      boxShadow: `0 4px 15px -3px ${colors.accent}40, 0 2px 8px -2px ${colors.accent}30`,
                    }
                  : {
                      borderColor: colors.accent,
                      color: colors.foreground,
                      backgroundColor: colors.card,
                      boxShadow: `0 2px 8px -2px ${colors.accent}20`,
                    }
              }
            >
              All
            </Button>
            <Button
              variant={taskFilter === "incomplete" ? "default" : "outline"}
              size="sm"
              onClick={() => setTaskFilter("incomplete")}
              className="transition-all duration-300 hover:scale-105"
              style={
                taskFilter === "incomplete"
                  ? {
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                      color: colors.card,
                      boxShadow: `0 4px 15px -3px ${colors.accent}40, 0 2px 8px -2px ${colors.accent}30`,
                    }
                  : {
                      borderColor: colors.accent,
                      color: colors.foreground,
                      backgroundColor: colors.card,
                      boxShadow: `0 2px 8px -2px ${colors.accent}20`,
                    }
              }
            >
              Incomplete
            </Button>
            <Button
              variant={taskFilter === "complete" ? "default" : "outline"}
              size="sm"
              onClick={() => setTaskFilter("complete")}
              className="transition-all duration-300 hover:scale-105"
              style={
                taskFilter === "complete"
                  ? {
                      background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                      color: colors.card,
                      boxShadow: `0 4px 15px -3px ${colors.accent}40, 0 2px 8px -2px ${colors.accent}30`,
                    }
                  : {
                      borderColor: colors.accent,
                      color: colors.foreground,
                      backgroundColor: colors.card,
                      boxShadow: `0 2px 8px -2px ${colors.accent}20`,
                    }
              }
            >
              Complete
            </Button>
          </div>

          <div className="space-y-4">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-12">
                <div 
                  className="rounded-xl p-8 shadow-lg backdrop-blur-sm transition-all duration-300"
                  style={{ 
                    backgroundColor: colors.card + "80",
                    border: `1px solid ${colors.accent}20`
                  }}
                >
                  <p 
                    className="text-lg transition-all duration-300"
                    style={{ color: colors.foreground + "80" }}
                  >
                    {searchQuery
                      ? "No tasks found matching your search."
                      : "No tasks yet. Create your first colorful task!"}
                  </p>
                </div>
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onUpdate={handleUpdateTask}
                  onDelete={handleDeleteTask}
                  onAddSubtask={handleAddSubtask}
                />
              ))
            )}
          </div>

          {/* Create Task Form Popup */}
          {showCreateForm && (
            <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
              <CreateTaskForm
                categories={taskManager.getCategories()}
                onCreateTask={handleCreateTask}
                onCancel={() => setShowCreateForm(false)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}