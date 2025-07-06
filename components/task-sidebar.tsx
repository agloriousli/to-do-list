"use client"

import { useState } from "react"
import type { TaskManager } from "../classes/task-manager"
import { TaskUrgency } from "../types/task-types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import { BarChart3, Calendar, Clock, AlertTriangle, CheckCircle, Plus, Search } from "lucide-react"
import { useTheme } from "../lib/theme-context"
import { ThemeSelector } from "./theme-selector"

interface TaskSidebarProps {
  taskManager: TaskManager
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  onSearch: (query: string) => void
}

export function TaskSidebar({ taskManager, selectedCategory, onCategorySelect, onSearch }: TaskSidebarProps) {
  const { colors, isHydrated } = useTheme()
  const [searchQuery, setSearchQuery] = useState("")
  const [newCategory, setNewCategory] = useState("")
  const [showAddCategory, setShowAddCategory] = useState(false)

  const stats = taskManager.getTaskStats()
  const categories = taskManager.getCategories()
  const overdueTasks = taskManager.getOverdueTasks()
  const upcomingTasks = taskManager.getUpcomingTasks()

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    onSearch(query)
  }

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      taskManager.addCategory(newCategory.trim())
      setNewCategory("")
      setShowAddCategory(false)
    }
  }

  // Don't render until hydrated to prevent SSR/client mismatch
  if (!isHydrated) {
    return (
      <div className="w-80 bg-gray-50 border-r border-gray-200 p-4 space-y-4 overflow-y-auto">
        <div className="animate-pulse">
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className="w-80 border-r p-4 space-y-4 overflow-y-auto transition-all duration-300 pt-20"
      style={{ 
        backgroundColor: colors.card,
        borderColor: colors.accent + "20"
      }}
    >
      {/* Theme Selector */}
      <ThemeSelector />

      {/* Stats Overview */}
      <Card 
        className="transition-all duration-300 hover:shadow-lg"
        style={{ 
          backgroundColor: colors.background, 
          borderColor: colors.accent + "20",
          boxShadow: `0 4px 15px -3px ${colors.accent}20, 0 2px 8px -2px ${colors.accent}10`
        }}
      >
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center" style={{ color: colors.foreground }}>
            <BarChart3 className="h-5 w-5 mr-2" />
            Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: colors.foreground + "80" }}>Total Tasks</span>
            <Badge 
              variant="outline" 
              style={{ 
                borderColor: colors.accent,
                color: colors.foreground,
                backgroundColor: colors.card
              }}
            >
              {stats.total}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: colors.foreground + "80" }}>Completed</span>
            <Badge 
              style={{ 
                backgroundColor: colors.accent,
                color: colors.card
              }}
            >
              {stats.completed}
            </Badge>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm" style={{ color: colors.foreground + "80" }}>Completion Rate</span>
            <span className="text-sm font-medium" style={{ color: colors.foreground }}>
              {stats.completionRate}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2" style={{ boxShadow: `inset 0 2px 4px ${colors.accent}10` }}>
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                width: `${(stats.completionRate as number)}%`,
                boxShadow: `0 2px 8px ${colors.accent}40`,
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Search */}
      <Card style={{ backgroundColor: colors.background, borderColor: colors.accent + "20" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center" style={{ color: colors.foreground }}>
            <Search className="h-5 w-5 mr-2" />
            Search Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input 
            placeholder="Search tasks..." 
            value={searchQuery} 
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              backgroundColor: colors.card,
              borderColor: colors.accent + "40",
              color: colors.foreground,
            }}
          />
        </CardContent>
      </Card>

      {/* Quick Filters */}
      <Card style={{ backgroundColor: colors.background, borderColor: colors.accent + "20" }}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg" style={{ color: colors.foreground }}>Quick Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button 
            variant="ghost" 
            className="w-full justify-between" 
            onClick={() => onSearch("urgent")}
            style={{ color: colors.foreground }}
          >
            <span className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              Urgent Tasks
            </span>
            <Badge variant="destructive">{taskManager.getTasksByUrgency(TaskUrgency.URGENT).length}</Badge>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between" 
            onClick={() => onSearch("completed")}
            style={{ color: colors.foreground }}
          >
            <span className="flex items-center">
              <CheckCircle className="h-4 w-4 mr-2" />
              Completed
            </span>
            <Badge 
              style={{ 
                backgroundColor: colors.accent,
                color: colors.card
              }}
            >
              {stats.completed}
            </Badge>
          </Button>

          <Button 
            variant="ghost" 
            className="w-full justify-between" 
            onClick={() => onSearch("overdue")}
            style={{ color: colors.foreground }}
          >
            <span className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              Overdue
            </span>
            <Badge variant="destructive">{overdueTasks.length}</Badge>
          </Button>
        </CardContent>
      </Card>

      {/* Urgent Tasks */}
      {(overdueTasks.length > 0 || upcomingTasks.length > 0) && (
        <Card style={{ backgroundColor: colors.background, borderColor: colors.accent + "20" }}>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center" style={{ color: "#ef4444" }}>
              <AlertTriangle className="h-5 w-5 mr-2" />
              Urgent
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {overdueTasks.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "#ef4444" }}>Overdue</span>
                <Badge variant="destructive">{overdueTasks.length}</Badge>
              </div>
            )}
            {upcomingTasks.length > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-sm" style={{ color: "#f97316" }}>Due Soon</span>
                <Badge 
                  variant="secondary"
                  style={{ 
                    backgroundColor: colors.accent + "20",
                    color: colors.foreground
                  }}
                >
                  {upcomingTasks.length}
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Categories */}
      <Card style={{ backgroundColor: colors.background, borderColor: colors.accent + "20" }}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg" style={{ color: colors.foreground }}>Categories</CardTitle>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowAddCategory(!showAddCategory)}
              style={{ color: colors.foreground }}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {showAddCategory && (
            <div className="flex space-x-2 mb-3">
              <Input
                placeholder="New category..."
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddCategory()}
                style={{
                  backgroundColor: colors.card,
                  borderColor: colors.accent + "40",
                  color: colors.foreground,
                }}
              />
              <Button 
                size="sm" 
                onClick={handleAddCategory}
                style={{
                  backgroundColor: colors.accent,
                  color: colors.card
                }}
              >
                Add
              </Button>
            </div>
          )}

          <Button
            variant={selectedCategory === null ? "default" : "ghost"}
            className="w-full justify-start transition-all duration-200 hover:scale-105"
            onClick={() => onCategorySelect(null)}
            style={
              selectedCategory === null
                ? {
                    background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                    color: colors.card,
                    boxShadow: `0 4px 15px -3px ${colors.accent}40, 0 2px 8px -2px ${colors.accent}30`,
                  }
                : {
                    color: colors.foreground,
                    backgroundColor: "transparent",
                    boxShadow: `0 2px 8px -2px ${colors.accent}20`,
                  }
            }
          >
            All Tasks
          </Button>

          {categories.map((category) => {
            const categoryTasks = taskManager.getTasksByCategory(category)
            const isSelected = selectedCategory === category
            return (
              <Button
                key={category}
                variant={isSelected ? "default" : "ghost"}
                className="w-full justify-between transition-all duration-200 hover:scale-105"
                onClick={() => onCategorySelect(category)}
                style={
                  isSelected
                    ? {
                        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
                        color: colors.card,
                        boxShadow: `0 4px 15px -3px ${colors.accent}40, 0 2px 8px -2px ${colors.accent}30`,
                      }
                    : {
                        color: colors.foreground,
                        backgroundColor: "transparent",
                        boxShadow: `0 2px 8px -2px ${colors.accent}20`,
                      }
                }
              >
                <span>{category}</span>
                <Badge 
                  variant="outline"
                  style={
                    isSelected
                      ? {
                          borderColor: colors.card,
                          color: colors.card,
                          backgroundColor: "transparent",
                        }
                      : {
                          borderColor: colors.accent,
                          color: colors.foreground,
                          backgroundColor: colors.card,
                        }
                  }
                >
                  {categoryTasks.length}
                </Badge>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </div>
  )
}
