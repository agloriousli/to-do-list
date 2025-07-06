export enum TaskType {
  LEARN = "Learn",
  DISCOVER = "Discover",
  DO = "Do",
  REPEAT = "Repeat",
}

export enum TaskUrgency {
  CASUAL = "Casual",
  IMPORTANT = "Important",
  URGENT = "Urgent",
}

export interface TaskLink {
  id: string
  url: string
  title: string
}

export interface TaskAttachment {
  id: string
  name: string
  url: string
  type: "image" | "file" | "link"
}

export interface TaskMessage {
  id: string
  content: string
  timestamp: Date
  author: string
  attachments: MessageAttachment[]
  type: "text" | "system"
  isStarred?: boolean
  isPinned?: boolean
  replyToId?: string
  reactions?: MessageReaction[]
}

export interface MessageReaction {
  emoji: string
  users: string[]
  count: number
}

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: "image" | "video" | "file" | "link"
  size?: number
  mimeType?: string
}

export interface TaskColor {
  primary: string
  secondary: string
  accent: string
  text: string
}

export const PASTEL_COLORS: { name: string; colors: TaskColor }[] = [
  // Gradient pastels (existing)
  {
    name: "Lavender Dream",
    colors: {
      primary: "#E6E6FA",
      secondary: "#DDA0DD",
      accent: "#9370DB",
      text: "#4B0082",
    },
  },
  {
    name: "Mint Fresh",
    colors: {
      primary: "#F0FFF0",
      secondary: "#98FB98",
      accent: "#00FA9A",
      text: "#006400",
    },
  },
  {
    name: "Peach Sunset",
    colors: {
      primary: "#FFEFD5",
      secondary: "#FFDAB9",
      accent: "#FF7F50",
      text: "#8B4513",
    },
  },
  {
    name: "Sky Blue",
    colors: {
      primary: "#F0F8FF",
      secondary: "#87CEEB",
      accent: "#4169E1",
      text: "#191970",
    },
  },
  {
    name: "Rose Garden",
    colors: {
      primary: "#FFF0F5",
      secondary: "#FFB6C1",
      accent: "#FF69B4",
      text: "#8B008B",
    },
  },
  {
    name: "Sunny Yellow",
    colors: {
      primary: "#FFFACD",
      secondary: "#F0E68C",
      accent: "#FFD700",
      text: "#B8860B",
    },
  },
  {
    name: "Ocean Breeze",
    colors: {
      primary: "#F0FFFF",
      secondary: "#AFEEEE",
      accent: "#20B2AA",
      text: "#008B8B",
    },
  },
  {
    name: "Coral Reef",
    colors: {
      primary: "#FFF8DC",
      secondary: "#F5DEB3",
      accent: "#FF7F50",
      text: "#A0522D",
    },
  },
  {
    name: "Purple Haze",
    colors: {
      primary: "#F8F8FF",
      secondary: "#D8BFD8",
      accent: "#9932CC",
      text: "#4B0082",
    },
  },
  {
    name: "Forest Green",
    colors: {
      primary: "#F5FFFA",
      secondary: "#90EE90",
      accent: "#32CD32",
      text: "#228B22",
    },
  },
  // Pure pastel colors
  {
    name: "Soft Pink",
    colors: {
      primary: "#FFE4E6",
      secondary: "#FFE4E6",
      accent: "#FF69B4",
      text: "#8B0040",
    },
  },
  {
    name: "Powder Blue",
    colors: {
      primary: "#E6F3FF",
      secondary: "#E6F3FF",
      accent: "#4A90E2",
      text: "#1E3A8A",
    },
  },
  {
    name: "Mint Green",
    colors: {
      primary: "#E8F5E8",
      secondary: "#E8F5E8",
      accent: "#10B981",
      text: "#065F46",
    },
  },
  {
    name: "Lavender",
    colors: {
      primary: "#F3E8FF",
      secondary: "#F3E8FF",
      accent: "#8B5CF6",
      text: "#581C87",
    },
  },
  {
    name: "Peach",
    colors: {
      primary: "#FFF2E6",
      secondary: "#FFF2E6",
      accent: "#F97316",
      text: "#9A3412",
    },
  },
  {
    name: "Lemon",
    colors: {
      primary: "#FFFBEB",
      secondary: "#FFFBEB",
      accent: "#F59E0B",
      text: "#92400E",
    },
  },
  {
    name: "Sage",
    colors: {
      primary: "#F0F4F0",
      secondary: "#F0F4F0",
      accent: "#6B7280",
      text: "#374151",
    },
  },
  {
    name: "Blush",
    colors: {
      primary: "#FDF2F8",
      secondary: "#FDF2F8",
      accent: "#EC4899",
      text: "#BE185D",
    },
  },
  {
    name: "Periwinkle",
    colors: {
      primary: "#EEF2FF",
      secondary: "#EEF2FF",
      accent: "#6366F1",
      text: "#3730A3",
    },
  },
  {
    name: "Seafoam",
    colors: {
      primary: "#ECFDF5",
      secondary: "#ECFDF5",
      accent: "#059669",
      text: "#064E3B",
    },
  },
]

export const DEFAULT_TASK_COLOR: TaskColor = {
  primary: "#FFFFFF",
  secondary: "#F3F4F6",
  accent: "#6B7280",
  text: "#1F2937",
}
