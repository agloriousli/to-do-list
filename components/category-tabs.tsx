"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Plus, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useTheme } from "../lib/theme-context"

interface CategoryTabsProps {
  categories: string[]
  selectedCategory: string | null
  onCategorySelect: (category: string | null) => void
  onAddCategory: (category: string) => void
  taskCounts: { [key: string]: number }
  totalTasks: number
}

export function CategoryTabs({
  categories,
  selectedCategory,
  onCategorySelect,
  onAddCategory,
  taskCounts,
  totalTasks,
}: CategoryTabsProps) {
  const { colors } = useTheme()
  const [showAddCategory, setShowAddCategory] = useState(false)
  const [newCategory, setNewCategory] = useState("")
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const checkScrollButtons = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1)
    }
  }

  useEffect(() => {
    checkScrollButtons()
    const scrollElement = scrollRef.current
    if (scrollElement) {
      scrollElement.addEventListener("scroll", checkScrollButtons)
      return () => scrollElement.removeEventListener("scroll", checkScrollButtons)
    }
  }, [categories])

  const handleAddCategory = () => {
    if (newCategory.trim()) {
      onAddCategory(newCategory.trim())
      setNewCategory("")
      setShowAddCategory(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleAddCategory()
    } else if (e.key === "Escape") {
      setShowAddCategory(false)
      setNewCategory("")
    }
  }

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -200, behavior: "smooth" })
    }
  }

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  const getCategoryStyle = (category: string | null, isSelected: boolean) => {
    if (isSelected) {
      return {
        background: `linear-gradient(135deg, ${colors.accent} 0%, ${colors.accent}80 100%)`,
        color: colors.card,
        transform: "translateY(-1px)",
        boxShadow: `0 10px 40px -10px ${colors.accent}40, 0 4px 20px -4px ${colors.accent}30`,
        border: `1px solid ${colors.accent}60`,
      }
    }
    return {
      background: colors.card + "E6",
      backdropFilter: "blur(12px)",
      border: `1px solid ${colors.accent}25`,
      color: colors.foreground,
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
    }
  }

  return (
    <div className="relative mb-6">
      {/* Add extra padding to prevent shadow clipping */}
      <Card 
        className="p-6 border-0 shadow-lg overflow-visible transition-all duration-300"
        style={{ 
          backgroundColor: colors.card + "99",
          backdropFilter: "blur(12px)"
        }}
      >
        <div className="flex items-center space-x-4">
          {/* Scroll Left Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            className={`shrink-0 h-12 w-12 rounded-full hover:scale-105 transition-all duration-300 ${
              !canScrollLeft ? "opacity-30" : ""
            }`}
            style={{
              backgroundColor: colors.card,
              color: colors.foreground,
              border: `1px solid ${colors.accent}20`,
              boxShadow: canScrollLeft
                ? `0 4px 20px -4px ${colors.accent}20, 0 2px 8px rgba(0, 0, 0, 0.08)`
                : "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          {/* Scrollable Categories Container with proper padding */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-x-auto scrollbar-hide py-2"
            style={{
              scrollBehavior: "smooth",
              WebkitOverflowScrolling: "touch",
              // Add padding to prevent shadow clipping
              paddingTop: "8px",
              paddingBottom: "8px",
              marginTop: "-8px",
              marginBottom: "-8px",
            }}
            onScroll={checkScrollButtons}
          >
            <div className="flex space-x-4 pb-2 min-w-max px-2">
              {/* All Tasks Tab */}
              <Button
                variant="ghost"
                onClick={() => onCategorySelect(null)}
                className="shrink-0 h-14 px-8 rounded-2xl transition-all duration-300 hover:scale-105 border-0"
                style={{
                  ...getCategoryStyle(null, selectedCategory === null),
                  minWidth: "fit-content",
                }}
              >
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-base">All Tasks</span>
                  <Badge
                    variant="secondary"
                    className="ml-1 border-0 px-3 py-1 rounded-full font-medium"
                    style={{
                      backgroundColor: selectedCategory === null ? colors.card + "40" : colors.accent + "20",
                      color: selectedCategory === null ? colors.card : colors.foreground,
                    }}
                  >
                    {totalTasks}
                  </Badge>
                </div>
              </Button>

              {/* Category Tabs */}
              {categories.map((category) => (
                <Button
                  key={category}
                  variant="ghost"
                  onClick={() => onCategorySelect(category)}
                  className="shrink-0 h-14 px-8 rounded-2xl transition-all duration-300 hover:scale-105 border-0"
                  style={{
                    ...getCategoryStyle(category, selectedCategory === category),
                    minWidth: "fit-content",
                  }}
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-semibold text-base">{category}</span>
                    <Badge
                      variant="secondary"
                      className="ml-1 border-0 px-3 py-1 rounded-full font-medium"
                      style={{
                        backgroundColor: selectedCategory === category ? colors.card + "40" : colors.accent + "20",
                        color: selectedCategory === category ? colors.card : colors.foreground,
                      }}
                    >
                      {taskCounts[category] || 0}
                    </Badge>
                  </div>
                </Button>
              ))}

              {/* Add Category Input/Button */}
              {showAddCategory ? (
                <div className="flex items-center space-x-3 shrink-0">
                  <Input
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Category name..."
                    className="h-14 w-48 rounded-2xl text-base px-6 transition-all duration-300"
                    style={{
                      backgroundColor: colors.card,
                      borderColor: colors.accent + "40",
                      color: colors.foreground,
                      boxShadow: `0 4px 20px -4px ${colors.accent}15, 0 2px 8px rgba(0, 0, 0, 0.06)`,
                    }}
                    autoFocus
                  />
                  <Button
                    size="sm"
                    onClick={handleAddCategory}
                    className="h-14 px-4 rounded-2xl transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: colors.accent,
                      color: colors.card,
                      boxShadow: `0 4px 20px -4px ${colors.accent}30`,
                    }}
                  >
                    <Plus className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowAddCategory(false)
                      setNewCategory("")
                    }}
                    className="h-14 w-14 rounded-2xl transition-all duration-300 hover:scale-105"
                    style={{
                      backgroundColor: colors.card,
                      color: colors.foreground,
                      border: `1px solid ${colors.accent}20`,
                    }}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  onClick={() => setShowAddCategory(true)}
                  className="shrink-0 h-14 px-8 rounded-2xl transition-all duration-300 hover:scale-105 border-0"
                  style={{
                    background: colors.card + "E6",
                    backdropFilter: "blur(12px)",
                    border: `1px solid ${colors.accent}25`,
                    color: colors.foreground,
                    minWidth: "fit-content",
                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04), 0 1px 3px rgba(0, 0, 0, 0.06)",
                  }}
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Category
                </Button>
              )}
            </div>
          </div>

          {/* Scroll Right Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={scrollRight}
            disabled={!canScrollRight}
            className={`shrink-0 h-12 w-12 rounded-full hover:scale-105 transition-all duration-300 ${
              !canScrollRight ? "opacity-30" : ""
            }`}
            style={{
              backgroundColor: colors.card,
              color: colors.foreground,
              border: `1px solid ${colors.accent}20`,
              boxShadow: canScrollRight
                ? `0 4px 20px -4px ${colors.accent}20, 0 2px 8px rgba(0, 0, 0, 0.08)`
                : "0 2px 8px rgba(0, 0, 0, 0.04)",
            }}
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </Card>

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  )
}
