import {
  TaskType,
  TaskUrgency,
  type TaskLink,
  type TaskAttachment,
  type TaskColor,
  type TaskMessage,
  DEFAULT_TASK_COLOR,
} from "../types/task-types"

export interface MessageAttachment {
  id: string
  name: string
  url: string
  type: "image" | "video" | "file" | "link"
  size?: number
  mimeType?: string
}

export class Task {
  public id: string
  public name: string
  public type: TaskType
  public category: string
  public urgency: TaskUrgency[]
  public notes: string
  public dueDate: Date | null
  public links: TaskLink[]
  public attachments: TaskAttachment[]
  public subtasks: Task[]
  public isCompleted: boolean
  public createdAt: Date
  public updatedAt: Date
  public parentId: string | null
  public messages: TaskMessage[]
  public color: TaskColor

  constructor(
    name: string,
    type: TaskType = TaskType.DO,
    category = "Personal",
    urgency: TaskUrgency[] = [TaskUrgency.CASUAL],
    dueDate: Date | null = null,
    parentId: string | null = null,
    color: TaskColor = DEFAULT_TASK_COLOR,
  ) {
    this.id = this.generateId()
    this.name = name
    this.type = type
    this.category = category
    this.urgency = urgency
    this.notes = ""
    this.dueDate = dueDate
    this.links = []
    this.attachments = []
    this.subtasks = []
    this.isCompleted = false
    this.createdAt = new Date()
    this.updatedAt = new Date()
    this.parentId = parentId
    this.messages = []
    this.color = color

    this.updateUrgencyBasedOnDueDate()
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9)
  }

  private updateUrgencyBasedOnDueDate(): void {
    if (this.dueDate) {
      const now = new Date()
      const timeDiff = this.dueDate.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 3600)

      if (hoursDiff <= 48 && hoursDiff > 0) {
        if (!this.urgency.includes(TaskUrgency.URGENT)) {
          this.urgency.push(TaskUrgency.URGENT)
        }
      }
    }
  }

  public getCompletionPercentage(): number {
    if (this.subtasks.length === 0) {
      return this.isCompleted ? 100 : 0
    }

    const totalSubtasks = this.getAllSubtasksCount()
    const completedSubtasks = this.getCompletedSubtasksCount()

    return totalSubtasks > 0 ? Math.round((completedSubtasks / totalSubtasks) * 100) : 0
  }

  private getAllSubtasksCount(): number {
    let count = this.subtasks.length
    for (const subtask of this.subtasks) {
      count += subtask.getAllSubtasksCount()
    }
    return count
  }

  private getCompletedSubtasksCount(): number {
    let count = this.subtasks.filter((task) => task.isCompleted).length
    for (const subtask of this.subtasks) {
      count += subtask.getCompletedSubtasksCount()
    }
    return count
  }

  public addSubtask(subtask: Task): void {
    subtask.parentId = this.id
    // Inherit parent's color scheme with slight variation
    subtask.color = {
      ...this.color,
      primary: this.adjustColorBrightness(this.color.primary, 0.95),
      secondary: this.adjustColorBrightness(this.color.secondary, 0.9),
    }
    this.subtasks.push(subtask)
    this.updatedAt = new Date()
    this.addSystemMessage(`➕ Subtask added: ${subtask.name}`)
  }

  private adjustColorBrightness(hex: string, factor: number): string {
    // Remove # if present
    hex = hex.replace("#", "")

    // Parse RGB values
    const r = Number.parseInt(hex.substr(0, 2), 16)
    const g = Number.parseInt(hex.substr(2, 2), 16)
    const b = Number.parseInt(hex.substr(4, 2), 16)

    // Adjust brightness
    const newR = Math.round(r * factor)
    const newG = Math.round(g * factor)
    const newB = Math.round(b * factor)

    // Convert back to hex
    return `#${newR.toString(16).padStart(2, "0")}${newG.toString(16).padStart(2, "0")}${newB.toString(16).padStart(2, "0")}`
  }

  public removeSubtask(subtaskId: string): boolean {
    const index = this.subtasks.findIndex((task) => task.id === subtaskId)
    if (index !== -1) {
      this.subtasks.splice(index, 1)
      this.updatedAt = new Date()
      return true
    }

    // Check nested subtasks
    for (const subtask of this.subtasks) {
      if (subtask.removeSubtask(subtaskId)) {
        this.updatedAt = new Date()
        return true
      }
    }
    return false
  }

  public findSubtask(subtaskId: string): Task | null {
    for (const subtask of this.subtasks) {
      if (subtask.id === subtaskId) {
        return subtask
      }
      const found = subtask.findSubtask(subtaskId)
      if (found) return found
    }
    return null
  }

  public addLink(url: string, title: string): void {
    const link: TaskLink = {
      id: this.generateId(),
      url,
      title,
    }
    this.links.push(link)
    this.updatedAt = new Date()
  }

  public removeLink(linkId: string): void {
    this.links = this.links.filter((link) => link.id !== linkId)
    this.updatedAt = new Date()
  }

  public addAttachment(name: string, url: string, type: "image" | "file" | "link"): void {
    const attachment: TaskAttachment = {
      id: this.generateId(),
      name,
      url,
      type,
    }
    this.attachments.push(attachment)
    this.updatedAt = new Date()
  }

  public toggleCompletion(): void {
    const wasCompleted = this.isCompleted
    this.isCompleted = !this.isCompleted
    this.updatedAt = new Date()

    // Add system message
    if (this.isCompleted && !wasCompleted) {
      this.addSystemMessage("✅ Task marked as completed")
    } else if (!this.isCompleted && wasCompleted) {
      this.addSystemMessage("🔄 Task reopened")
    }

    // If marking as complete, mark all subtasks as complete
    if (this.isCompleted) {
      this.markAllSubtasksComplete()
    } else {
      // If marking as incomplete, reset all subtasks to incomplete
      this.resetAllSubtasksIncomplete()
    }
  }

  private markAllSubtasksComplete(): void {
    for (const subtask of this.subtasks) {
      subtask.isCompleted = true
      subtask.markAllSubtasksComplete()
    }
  }

  private resetAllSubtasksIncomplete(): void {
    for (const subtask of this.subtasks) {
      subtask.isCompleted = false
      subtask.resetAllSubtasksIncomplete()
    }
  }

  public updateTask(updates: Partial<Task>): void {
    Object.assign(this, updates)
    this.updatedAt = new Date()
    this.updateUrgencyBasedOnDueDate()
  }

  public updateColor(color: TaskColor): void {
    this.color = color
    this.updatedAt = new Date()
    this.addSystemMessage(`🎨 Task color updated to custom theme`)
  }

  public addMessage(content: string, author = "User", attachments: MessageAttachment[] = []): TaskMessage {
    const message: TaskMessage = {
      id: this.generateId(),
      content,
      timestamp: new Date(),
      author,
      attachments,
      type: "text",
      isStarred: false,
      isPinned: false,
      reactions: [],
    }
    this.messages.push(message)
    this.updatedAt = new Date()
    return message
  }

  public addSystemMessage(content: string): TaskMessage {
    const message: TaskMessage = {
      id: this.generateId(),
      content,
      timestamp: new Date(),
      author: "System",
      attachments: [],
      type: "system",
      isStarred: false,
      isPinned: false,
      reactions: [],
    }
    this.messages.push(message)
    this.updatedAt = new Date()
    return message
  }

  public deleteMessage(messageId: string): boolean {
    const index = this.messages.findIndex((msg) => msg.id === messageId)
    if (index !== -1) {
      this.messages.splice(index, 1)
      this.updatedAt = new Date()
      return true
    }
    return false
  }

  public addAttachmentToMessage(messageId: string, attachment: MessageAttachment): boolean {
    const message = this.messages.find((msg) => msg.id === messageId)
    if (message) {
      message.attachments.push(attachment)
      this.updatedAt = new Date()
      return true
    }
    return false
  }

  public toJSON(): any {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      category: this.category,
      urgency: this.urgency,
      notes: this.notes,
      dueDate: this.dueDate,
      links: this.links,
      attachments: this.attachments,
      subtasks: this.subtasks.map((task) => task.toJSON()),
      isCompleted: this.isCompleted,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      parentId: this.parentId,
      completionPercentage: this.getCompletionPercentage(),
      messages: this.messages,
      color: this.color,
    }
  }
}
