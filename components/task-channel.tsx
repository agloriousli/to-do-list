"use client"

import type React from "react"

import { useState, useRef, useEffect, useCallback } from "react"
import type { Task } from "../classes/task"
import type { MessageAttachment, MessageReaction } from "../types/task-types"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { toast } from "../hooks/use-toast"
import {
  Send,
  Paperclip,
  ImageIcon,
  Video,
  File,
  Download,
  Trash2,
  MessageSquare,
  X,
  MoreHorizontal,
  Star,
  Pin,
  Reply,
  Heart,
  ThumbsUp,
  Smile,
  Copy,
  Move,
  Tag,
  CheckSquare,
  Link as LinkIcon,
  ChevronUp,
  ChevronDown,
} from "lucide-react"
import { format } from "date-fns"
import { useTheme } from "../lib/theme-context"

interface TaskChannelProps {
  task: Task
  onUpdate: (task: Task) => void
  showHeader?: boolean
}

interface LassoSelection {
  startX: number
  startY: number
  endX: number
  endY: number
  isActive: boolean
}

export function TaskChannel({ task, onUpdate, showHeader = true }: TaskChannelProps) {
  const { colors } = useTheme()
  
  // Generate color variations for messages
  const messageColors = {
    primary: colors.card + "E6", // Slightly transparent card color
    secondary: colors.background + "CC", // Slightly transparent background
    accent: colors.accent + "60", // Muted accent
    text: colors.foreground + "CC", // Slightly muted text
    border: colors.accent + "30", // Subtle border
  }
  
  const [newMessage, setNewMessage] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [selectedMessages, setSelectedMessages] = useState<Set<string>>(new Set())
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [messagesToDelete, setMessagesToDelete] = useState<string[]>([])
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isMessagesExpanded, setIsMessagesExpanded] = useState(showHeader ? false : true)
  const [lassoSelection, setLassoSelection] = useState<LassoSelection>({
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0,
    isActive: false,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const lassoCanvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [task.messages])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isMultiSelectMode) return

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedMessages.size > 0) {
          handleBulkDelete()
        }
      } else if (e.key === "Escape") {
        exitMultiSelectMode()
      } else if (e.ctrlKey || e.metaKey) {
        if (e.key === "a") {
          e.preventDefault()
          selectAllMessages()
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [isMultiSelectMode, selectedMessages])

  // Draw lasso selection rectangle
  useEffect(() => {
    if (!lassoCanvasRef.current || !containerRef.current) return

    const canvas = lassoCanvasRef.current
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size to match container
    const container = containerRef.current
    canvas.width = container.clientWidth
    canvas.height = container.clientHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Only draw selection rectangle if lasso is active
    if (lassoSelection.isActive) {
      // Draw selection rectangle
      const left = Math.min(lassoSelection.startX, lassoSelection.endX)
      const top = Math.min(lassoSelection.startY, lassoSelection.endY)
      const width = Math.abs(lassoSelection.endX - lassoSelection.startX)
      const height = Math.abs(lassoSelection.endY - lassoSelection.startY)

      // Draw semi-transparent fill with more visible color
      ctx.fillStyle = "rgba(59, 130, 246, 0.3)"
      ctx.fillRect(left, top, width, height)

      // Draw border with more visible color
      ctx.strokeStyle = "rgba(59, 130, 246, 1)"
      ctx.lineWidth = 3
      ctx.setLineDash([8, 4])
      ctx.strokeRect(left, top, width, height)
      
      // Reset line dash
      ctx.setLineDash([])
    }
  }, [lassoSelection.isActive, lassoSelection.startX, lassoSelection.startY, lassoSelection.endX, lassoSelection.endY])

  // Check which messages are within the lasso selection
  const getMessagesInLassoSelection = () => {
    if (!lassoSelection.isActive || !containerRef.current) return []

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const left = Math.min(lassoSelection.startX, lassoSelection.endX)
    const top = Math.min(lassoSelection.startY, lassoSelection.endY)
    const right = Math.max(lassoSelection.startX, lassoSelection.endX)
    const bottom = Math.max(lassoSelection.startY, lassoSelection.endY)

    const messageElements = container.querySelectorAll('[data-message-id]')
    const selectedIds: string[] = []

    messageElements.forEach((element) => {
      const messageId = element.getAttribute('data-message-id')
      if (!messageId) return

      const elementRect = element.getBoundingClientRect()
      const elementLeft = elementRect.left - containerRect.left
      const elementTop = elementRect.top - containerRect.top
      const elementRight = elementLeft + elementRect.width
      const elementBottom = elementTop + elementRect.height

      // Check if element intersects with lasso selection
      if (
        elementLeft < right &&
        elementRight > left &&
        elementTop < bottom &&
        elementBottom > top
      ) {
        selectedIds.push(messageId)
      }
    })

    return selectedIds
  }

  // Update selected messages based on lasso selection
  useEffect(() => {
    if (lassoSelection.isActive) {
      const selectedIds = getMessagesInLassoSelection()
      setSelectedMessages(new Set(selectedIds))
    }
  }, [lassoSelection.startX, lassoSelection.startY, lassoSelection.endX, lassoSelection.endY, lassoSelection.isActive])

  const handleSendMessage = () => {
    if (!newMessage.trim() && attachments.length === 0) return

    const messageAttachments: MessageAttachment[] = attachments.map((file) => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      url: URL.createObjectURL(file),
      type: getFileType(file.type),
      size: file.size,
      mimeType: file.type,
    }))

    const message = task.addMessage(newMessage.trim() || "📎 Attachment", "User", messageAttachments)
    if (replyingTo) {
      message.replyToId = replyingTo
      setReplyingTo(null)
    }

    onUpdate(task)
    setNewMessage("")
    setAttachments([])
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    setAttachments((prev) => [...prev, ...files])
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    setAttachments((prev) => [...prev, ...files])
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index))
  }

  // Multi-select functionality
  const enterMultiSelectMode = useCallback((messageId?: string) => {
    setIsMultiSelectMode(true)
    if (messageId) {
      setSelectedMessages(new Set([messageId]))
    }
  }, [])

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false)
    setSelectedMessages(new Set())
    setLassoSelection({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isActive: false,
    })
    setIsDragging(false)
    setDragStart(null)
  }

  const toggleMessageSelection = (messageId: string) => {
    const newSelected = new Set(selectedMessages)
    if (newSelected.has(messageId)) {
      newSelected.delete(messageId)
    } else {
      newSelected.add(messageId)
    }
    setSelectedMessages(newSelected)

    if (newSelected.size === 0) {
      exitMultiSelectMode()
    }
  }

  const selectAllMessages = () => {
    // Include all messages (both user and system messages)
    const allMessageIds = task.messages.map((msg) => msg.id)
    setSelectedMessages(new Set(allMessageIds))
  }

  const handleMessageClick = (messageId: string, e: React.MouseEvent) => {
    // Prevent default behavior that might cause issues
    e.preventDefault()

    if (e.shiftKey && !isMultiSelectMode) {
      enterMultiSelectMode(messageId)
    } else if (isMultiSelectMode) {
      toggleMessageSelection(messageId)
    }
  }

  const handleLongPressStart = (messageId: string, _e: React.MouseEvent | React.TouchEvent) => {
    const timer = setTimeout(() => {
      enterMultiSelectMode(messageId)
    }, 500)
    setLongPressTimer(timer)
  }

  const handleLongPressEnd = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  // Lasso selection mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only start lasso selection if clicking on empty space (not on buttons or interactive elements)
    if (!containerRef.current) return

    // Check if we're clicking on a message or interactive element
    const target = e.target as HTMLElement
    if (target.closest('button') || target.closest('input') || target.closest('textarea') || target.closest('canvas')) {
      return
    }

    e.preventDefault()
    e.stopPropagation()
    
    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top

    setDragStart({ x, y })
    setIsDragging(false)
    
    // Reset lasso selection
    setLassoSelection({
      startX: 0,
      startY: 0,
      endX: 0,
      endY: 0,
      isActive: false,
    })
  }

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragStart || !containerRef.current) return

    const container = containerRef.current
    const containerRect = container.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const y = e.clientY - containerRect.top

    // Check if we've moved enough to start dragging (threshold of 5px)
    const deltaX = Math.abs(x - dragStart.x)
    const deltaY = Math.abs(y - dragStart.y)
    
    if (!isDragging && (deltaX > 5 || deltaY > 5)) {
      setIsDragging(true)
      
      // Start lasso selection
      setLassoSelection({
        startX: dragStart.x,
        startY: dragStart.y,
        endX: x,
        endY: y,
        isActive: true,
      })

      // Enter multi-select mode if not already in it
      if (!isMultiSelectMode) {
        enterMultiSelectMode()
      }
    }

    if (isDragging) {
      e.preventDefault()
      e.stopPropagation()
      
      // Update lasso selection with current mouse position
      setLassoSelection(prev => ({
        ...prev,
        endX: x,
        endY: y,
      }))
    }
  }, [dragStart, isDragging, isMultiSelectMode, enterMultiSelectMode])

  const handleMouseUp = (e: React.MouseEvent) => {
    if (isDragging) {
      // Finalize the selection before stopping lasso selection
      const selectedIds = getMessagesInLassoSelection()
      setSelectedMessages(new Set(selectedIds))
      
      // Stop lasso selection
      setLassoSelection(prev => ({ ...prev, isActive: false }))
      setIsDragging(false)
      setDragStart(null)
    }
  }

  const deleteMessage = (messageId: string) => {
    task.deleteMessage(messageId)
    onUpdate(task)
  }

  const handleBulkDelete = () => {
    setMessagesToDelete(Array.from(selectedMessages))
    setShowDeleteDialog(true)
  }

  const confirmDelete = () => {
    messagesToDelete.forEach((messageId) => {
      task.deleteMessage(messageId)
    })
    onUpdate(task)
    setShowDeleteDialog(false)
    setMessagesToDelete([])
    exitMultiSelectMode()
    toast({
      title: "Messages deleted",
      description: `Successfully deleted ${messagesToDelete.length} message${messagesToDelete.length !== 1 ? "s" : ""}.`,
    })
  }

  const handleCopyMessages = () => {
    const selectedMessageTexts = Array.from(selectedMessages)
      .map((id) => {
        const message = task.messages.find((m) => m.id === id)
        return message ? `${message.author}: ${message.content}` : ""
      })
      .filter(Boolean)
      .join("\n")

    navigator.clipboard.writeText(selectedMessageTexts)
    toast({
      title: "Messages copied",
      description: `Copied ${selectedMessages.size} message${selectedMessages.size !== 1 ? "s" : ""} to clipboard.`,
    })
  }

  const toggleMessageStar = (messageId: string) => {
    const message = task.messages.find((m) => m.id === messageId)
    if (message) {
      message.isStarred = !message.isStarred
      onUpdate(task)
    }
  }

  const toggleMessagePin = (messageId: string) => {
    const message = task.messages.find((m) => m.id === messageId)
    if (message) {
      message.isPinned = !message.isPinned
      onUpdate(task)
    }
  }

  const addReaction = (messageId: string, emoji: string) => {
    const message = task.messages.find((m) => m.id === messageId)
    if (message) {
      if (!message.reactions) {
        message.reactions = []
      }

      const existingReaction = message.reactions.find((r) => r.emoji === emoji)
      if (existingReaction) {
        if (existingReaction.users.includes("User")) {
          existingReaction.users = existingReaction.users.filter((u) => u !== "User")
          existingReaction.count--
          if (existingReaction.count === 0) {
            message.reactions = message.reactions.filter((r) => r.emoji !== emoji)
          }
        } else {
          existingReaction.users.push("User")
          existingReaction.count++
        }
      } else {
        message.reactions.push({
          emoji,
          count: 1,
          users: ["User"],
        })
      }
      onUpdate(task)
    }
  }

  const getFileType = (mimeType: string): "image" | "video" | "file" | "link" => {
    if (mimeType.startsWith("image/")) return "image"
    if (mimeType.startsWith("video/")) return "video"
    return "file"
  }

  const getFileIcon = (type: "image" | "video" | "file" | "link") => {
    switch (type) {
      case "image":
        return <ImageIcon className="h-4 w-4" />
      case "video":
        return <Video className="h-4 w-4" />
      case "file":
        return <File className="h-4 w-4" />
      case "link":
        return <LinkIcon className="h-4 w-4" />
      default:
        return <File className="h-4 w-4" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getReplyMessage = (replyToId: string) => {
    return task.messages.find((m) => m.id === replyToId)
  }

  const renderAttachment = (attachment: MessageAttachment) => {
    switch (attachment.type) {
      case "image":
        return (
          <div className="mt-2">
            <img
              src={attachment.url}
              alt={attachment.name}
              className="max-w-full h-auto rounded-lg max-h-48 object-cover"
            />
          </div>
        )
      case "video":
        return (
          <div className="mt-2">
            <video
              src={attachment.url}
              controls
              className="max-w-full h-auto rounded-lg max-h-48"
            />
          </div>
        )
      default:
        return (
          <div className="mt-2 flex items-center justify-between p-2 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              {getFileIcon(attachment.type)}
              <div>
                <p className="text-sm font-medium">{attachment.name}</p>
                {attachment.size && <p className="text-xs text-gray-500">{formatFileSize(attachment.size)}</p>}
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={() => window.open(attachment.url, "_blank")}>
              <Download className="h-4 w-4" />
            </Button>
          </div>
        )
    }
  }

  // Sort messages: pinned first, then by timestamp
  const sortedMessages = [...task.messages].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1
    if (!a.isPinned && b.isPinned) return 1
    return a.timestamp.getTime() - b.timestamp.getTime()
  })

  const replyingToMessage = replyingTo ? getReplyMessage(replyingTo) : null

  const renderMessage = (message: any) => {
    try {
      // Existing message rendering logic
      return (
        <Card
          key={message.id}
          data-message-id={message.id}
          className={`group relative cursor-pointer transition-all duration-200 ${
            message.type === "system" ? "bg-blue-50" : message.isPinned ? "bg-yellow-50 border-yellow-200" : ""
          } ${selectedMessages.has(message.id) ? "ring-2 ring-blue-500 bg-blue-50" : ""} ${
            isMultiSelectMode ? "hover:bg-blue-25" : ""
          }`}
          style={{
            backgroundColor: messageColors.primary,
            borderColor: messageColors.border,
            color: messageColors.text,
          }}
          onClick={(e) => handleMessageClick(message.id, e)}
          onMouseDown={(e) => handleLongPressStart(message.id, e)}
          onMouseUp={handleLongPressEnd}
          onMouseLeave={handleLongPressEnd}
          onTouchStart={(e) => handleLongPressStart(message.id, e)}
          onTouchEnd={handleLongPressEnd}
        >
          <CardContent className="px-4 py-1">
            {message.isPinned && (
              <div className="flex items-center space-x-1 mb-2" style={{ color: messageColors.accent }}>
                <Pin className="h-3 w-3" />
                <span className="text-xs font-medium">Pinned Message</span>
              </div>
            )}

            {message.replyToId && (
              <div className="mb-2 p-2 rounded border-l-4" style={{ 
                backgroundColor: messageColors.secondary,
                borderColor: messageColors.border 
              }}>
                <div className="flex items-center space-x-1 mb-1">
                  <Reply className="h-3 w-3" style={{ color: messageColors.text }} />
                  <span className="text-xs" style={{ color: messageColors.text }}>
                    Replying to {getReplyMessage(message.replyToId)?.author}
                  </span>
                </div>
                <p className="text-xs truncate" style={{ color: messageColors.text }}>{getReplyMessage(message.replyToId)?.content}</p>
              </div>
            )}

            {/* Main message content with Discord-style layout */}
            <div className="flex items-start justify-between group">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 mb-1">
                  <span
                    className="text-sm font-medium"
                    style={{ color: messageColors.text }}
                  >
                    {message.author}
                  </span>
                  <span className="text-xs" style={{ color: messageColors.text + "80" }}>{format(message.timestamp, "MMM d, h:mm a")}</span>
                  {message.isStarred && <Star className="h-3 w-3 text-yellow-500 fill-current" />}
                </div>
                {message.content && <p className="text-sm whitespace-pre-wrap" style={{ color: messageColors.text }}>{message.content}</p>}
                {message.attachments.map((attachment: MessageAttachment) => (
                  <div key={attachment.id}>{renderAttachment(attachment)}</div>
                ))}

                {/* Reactions */}
                {message.reactions && message.reactions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {message.reactions.map((reaction: MessageReaction) => (
                      <Button
                        key={reaction.emoji}
                        variant="ghost"
                        size="sm"
                        className={`h-6 px-2 text-xs ${
                          reaction.users.includes("User") ? "bg-blue-100 text-blue-700" : ""
                        }`}
                        style={{
                          backgroundColor: messageColors.secondary,
                          color: messageColors.text,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          addReaction(message.id, reaction.emoji)
                        }}
                      >
                        {reaction.emoji} {reaction.count}
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {/* Discord-style action buttons on the right */}
              <div className="flex items-center space-x-1 ml-2 shrink-0">


                {/* Discord-style trash button - visible on hover */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteMessage(message.id)
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                  style={{ color: messageColors.text }}
                  title="Delete message"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* More options menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                      style={{ color: messageColors.text }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setReplyingTo(message.id)}>
                      <Reply className="h-4 w-4 mr-2" />
                      Reply
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleMessageStar(message.id)}>
                      <Star className="h-4 w-4 mr-2" />
                      {message.isStarred ? "Unstar" : "Star"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toggleMessagePin(message.id)}>
                      <Pin className="h-4 w-4 mr-2" />
                      {message.isPinned ? "Unpin" : "Pin"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => enterMultiSelectMode(message.id)}>
                      <CheckSquare className="h-4 w-4 mr-2" />
                      Select
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addReaction(message.id, "👍")}>
                      <ThumbsUp className="h-4 w-4 mr-2" />👍
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addReaction(message.id, "❤️")}>
                      <Heart className="h-4 w-4 mr-2" />
                      ❤️
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => addReaction(message.id, "😊")}>
                      <Smile className="h-4 w-4 mr-2" />😊
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => deleteMessage(message.id)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      )
    } catch (error) {
      console.error("Error rendering message:", error)
      return null
    }
  }

  return (
    <div className={showHeader ? "border-t mt-4" : ""} style={{ borderColor: showHeader ? colors.accent + "40" : "transparent" }}>
      {showHeader && (
        <div className="p-4" style={{ borderColor: colors.accent + "20" }}>
          <div className="flex items-center">
            <MessageSquare className="h-4 w-4 mr-2" style={{ color: colors.foreground }} />
            <span style={{ color: colors.foreground }}>Messages for {task.name}</span>
            <Badge variant="secondary" className="ml-auto mr-2" style={{ backgroundColor: colors.accent + "20", color: colors.foreground }}>
              {task.messages.length}
            </Badge>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMessagesExpanded(!isMessagesExpanded)}
              style={{ color: colors.foreground }}
            >
              {isMessagesExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}

      {isMessagesExpanded && (

      <div className="border-t" style={{ borderColor: colors.accent + "30" }}>
          {/* Multi-select toolbar */}
          {isMultiSelectMode && (
            <div className="sticky top-0 z-10 bg-blue-50 border-b border-blue-200 p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="sm" onClick={exitMultiSelectMode}>
                    <X className="h-4 w-4" />
                  </Button>
                  <span className="text-sm font-medium text-blue-700">
                    {selectedMessages.size} message{selectedMessages.size !== 1 ? "s" : ""} selected
                  </span>
                  <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                    Click and drag to lasso select messages
                  </span>
                </div>
                <div className="flex items-center space-x-1">
                  <Button variant="ghost" size="sm" onClick={selectAllMessages} title="Select All (Ctrl+A)">
                    <CheckSquare className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={handleCopyMessages} title="Copy">
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Move to...">
                    <Move className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" title="Tag">
                    <Tag className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleBulkDelete}
                    className="text-red-600 hover:text-red-700"
                    title="Delete (Del)"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Messages List with Lasso Selection */}
          <div className="relative max-h-96">
            <div
              ref={containerRef}
              className={`max-h-96 overflow-y-auto p-4 space-y-3 relative ${
                isDragging ? 'bg-blue-50' : ''
              }`}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              style={{ cursor: isDragging ? 'crosshair' : 'default' }}
            >
              {task.messages.length === 0 ? (
                <div className="text-center py-8" style={{ color: messageColors.text + "80" }}>
                  <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" style={{ color: messageColors.text }} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              ) : (
                sortedMessages.map((message) => renderMessage(message))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Lasso Selection Canvas */}
            <canvas
              ref={lassoCanvasRef}
              className="absolute inset-0 pointer-events-none z-10"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
              }}
            />
          </div>

          {/* Reply Preview */}
          {replyingToMessage && (
            <div className="px-4 py-2 border-t" style={{ 
              backgroundColor: messageColors.secondary,
              borderColor: messageColors.border 
            }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Reply className="h-4 w-4" style={{ color: messageColors.text }} />
                  <span className="text-sm" style={{ color: messageColors.text }}>
                    Replying to <span className="font-medium">{replyingToMessage.author}</span>
                  </span>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setReplyingTo(null)} style={{ color: messageColors.text }}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-sm mt-1 truncate" style={{ color: messageColors.text + "80" }}>{replyingToMessage.content}</p>
            </div>
          )}

          {/* Message Input */}
          <div
            className={`p-4 border-t ${dragOver ? "bg-blue-50 border-blue-200" : ""}`}
            style={{ 
              borderColor: messageColors.border,
              backgroundColor: messageColors.primary,
              margin: "-12px -12px -12px -12px",
              padding: "16px",
              borderTopLeftRadius: "0",
              borderTopRightRadius: "0",
              borderBottomLeftRadius: "8px",
              borderBottomRightRadius: "8px",
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
          >
            {/* Attachment Preview */}
            {attachments.length > 0 && (
              <div className="mb-3 space-y-2">
                {attachments.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: messageColors.secondary }}>
                    <div className="flex items-center space-x-2">
                      {getFileIcon(getFileType(file.type))}
                      <div>
                        <p className="text-sm font-medium" style={{ color: messageColors.text }}>{file.name}</p>
                        <p className="text-xs" style={{ color: messageColors.text + "80" }}>{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => removeAttachment(index)} style={{ color: messageColors.text }}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex space-x-2">
              <div className="flex-1">
                <Textarea
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={
                    replyingToMessage
                      ? `Reply to ${replyingToMessage.author}...`
                      : "Type a message... (Shift+Enter for new line)"
                  }
                  rows={2}
                  className="resize-none"
                  disabled={isMultiSelectMode}
                  style={{
                    backgroundColor: messageColors.secondary,
                    color: messageColors.text,
                  }}
                />
              </div>
              <div className="flex flex-col space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isMultiSelectMode}
                  style={{ color: messageColors.text }}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={(!newMessage.trim() && attachments.length === 0) || isMultiSelectMode}
                  size="sm"
                  style={{
                    backgroundColor: colors.accent,
                    color: "white",
                    border: `1px solid ${colors.accent}`,
                  }}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
            />

            {dragOver && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg" style={{ backgroundColor: messageColors.accent + "20" }}>
                <div className="text-center">
                  <Paperclip className="h-8 w-8 mx-auto mb-2" style={{ color: messageColors.accent }} />
                  <p className="font-medium" style={{ color: messageColors.accent }}>Drop files here to attach</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Message{messagesToDelete.length > 1 ? "s" : ""}</DialogTitle>
            <DialogDescription>
              {messagesToDelete.length === 1
                ? "Are you sure you want to delete this message? This action cannot be undone."
                : `Are you sure you want to delete ${messagesToDelete.length} messages? This action cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete {messagesToDelete.length > 1 ? `${messagesToDelete.length} Messages` : "Message"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
