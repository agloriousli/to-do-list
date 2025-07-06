import { Task } from "./task"
import { TaskType, TaskUrgency, type TaskColor, DEFAULT_TASK_COLOR } from "../types/task-types"

export class TaskManager {
  private tasks: Task[] = []
  private categories: Set<string> = new Set(["Personal", "School", "Work", "Vacation"])
  private static instance: TaskManager
  private initialized = false

  constructor() {
    // Don't load from storage during SSR
    if (typeof window !== "undefined") {
    this.loadFromStorage()
      this.initialized = true
    }
  }

  public static getInstance(): TaskManager {
    if (!TaskManager.instance) {
      TaskManager.instance = new TaskManager()
    }
    return TaskManager.instance
  }

  public ensureInitialized(): void {
    if (!this.initialized && typeof window !== "undefined") {
      this.loadFromStorage()
      this.initialized = true
    }
  }

  public createTask(
    name: string,
    type: TaskType = TaskType.DO,
    category: string | string[] = "Personal",
    urgency: TaskUrgency[] = [TaskUrgency.CASUAL],
    dueDate: Date | null = null,
    color: TaskColor = DEFAULT_TASK_COLOR,
  ): Task {
    this.ensureInitialized()
    const task = new Task(name, type, category, urgency, dueDate, null, color)
    task.addSystemMessage("🎯 Task created! Use this channel to track progress, share updates, and collaborate.")
    this.tasks.push(task)
    const categories = Array.isArray(category) ? category : [category]
    categories.forEach(cat => this.categories.add(cat))
    this.saveToStorage()
    return task
  }

  public getAllTasks(): Task[] {
    this.ensureInitialized()
    return [...this.tasks]
  }

  public getTaskById(id: string): Task | null {
    this.ensureInitialized()
    for (const task of this.tasks) {
      if (task.id === id) return task
      const found = task.findSubtask(id)
      if (found) return found
    }
    return null
  }

  public updateTask(id: string, updates: Partial<Task>): boolean {
    this.ensureInitialized()
    const task = this.getTaskById(id)
    if (task) {
      task.updateTask(updates)
      if (updates.category) {
        const categories = Array.isArray(updates.category) ? updates.category : [updates.category]
        categories.forEach(cat => this.categories.add(cat))
      }
      this.saveToStorage()
      return true
    }
    return false
  }

  public updateTaskColor(id: string, color: TaskColor): boolean {
    this.ensureInitialized()
    const task = this.getTaskById(id)
    if (task) {
      task.updateColor(color)
      this.saveToStorage()
      return true
    }
    return false
  }

  public deleteTask(id: string): boolean {
    this.ensureInitialized()
    const index = this.tasks.findIndex((task) => task.id === id)
    if (index !== -1) {
      this.tasks.splice(index, 1)
      this.saveToStorage()
      return true
    }

    // Check if it's a subtask
    for (const task of this.tasks) {
      if (task.removeSubtask(id)) {
        this.saveToStorage()
        return true
      }
    }
    return false
  }

  public addSubtask(parentId: string, subtaskName: string): Task | null {
    this.ensureInitialized()
    const parentTask = this.getTaskById(parentId)
    if (parentTask) {
      const subtask = new Task(
        subtaskName,
        TaskType.DO,
        parentTask.category,
        [TaskUrgency.CASUAL],
        null,
        parentId,
        parentTask.color,
      )
      parentTask.addSubtask(subtask)
      this.saveToStorage()
      return subtask
    }
    return null
  }

  public createSubtask(
    parentId: string,
    name: string,
    type: TaskType = TaskType.DO,
    category: string | string[],
    urgency: TaskUrgency[] = [TaskUrgency.CASUAL],
    dueDate: Date | null = null,
    color: TaskColor = DEFAULT_TASK_COLOR,
  ): Task | null {
    this.ensureInitialized()
    const parentTask = this.getTaskById(parentId)
    if (parentTask) {
      const subtask = new Task(name, type, category, urgency, dueDate, parentId, color)
      parentTask.addSubtask(subtask)
      this.saveToStorage()
      return subtask
    }
    return null
  }

  public getTasksByCategory(category: string): Task[] {
    this.ensureInitialized()
    return this.tasks.filter((task) => task.category.includes(category))
  }

  public getTasksByUrgency(urgency: TaskUrgency): Task[] {
    this.ensureInitialized()
    return this.tasks.filter((task) => task.urgency.includes(urgency))
  }

  public getOverdueTasks(): Task[] {
    this.ensureInitialized()
    const now = new Date()
    return this.tasks.filter((task) => task.dueDate && task.dueDate < now && !task.isCompleted)
  }

  public getUpcomingTasks(hours = 48): Task[] {
    this.ensureInitialized()
    const now = new Date()
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000)

    return this.tasks.filter(
      (task) => task.dueDate && task.dueDate > now && task.dueDate <= futureTime && !task.isCompleted,
    )
  }

  public getCategories(): string[] {
    this.ensureInitialized()
    return Array.from(this.categories)
  }

  public addCategory(category: string): void {
    this.ensureInitialized()
    this.categories.add(category)
    this.saveToStorage()
  }

  public searchTasks(query: string): Task[] {
    this.ensureInitialized()
    const searchResults: Task[] = []
    const searchInTask = (task: Task) => {
      if (
        task.name.toLowerCase().includes(query.toLowerCase()) ||
        task.notes.toLowerCase().includes(query.toLowerCase())
      ) {
        searchResults.push(task)
      }
      task.subtasks.forEach(searchInTask)
    }

    this.tasks.forEach(searchInTask)
    return searchResults
  }

  private saveToStorage(): void {
    if (typeof window === "undefined") return
    
    try {
      const data = {
        tasks: this.tasks.map((task) => task.toJSON()),
        categories: Array.from(this.categories),
      }
      localStorage.setItem("todoApp", JSON.stringify(data))
    } catch (error) {
      console.error("Failed to save to storage:", error)
    }
  }

  private loadFromStorage(): void {
    if (typeof window === "undefined") return
    
    try {
      const data = localStorage.getItem("todoApp")
      if (data) {
        const parsed = JSON.parse(data)
        this.categories = new Set(parsed.categories || ["Personal", "School", "Work", "Vacation"])
        this.tasks = (parsed.tasks || []).map((taskData: any) => this.deserializeTask(taskData))
      }
    } catch (error) {
      console.error("Failed to load from storage:", error)
    }
  }

  private deserializeTask(data: any): Task {
    const task = new Task(
      data.name,
      data.type,
      data.category,
      data.urgency,
      data.dueDate ? new Date(data.dueDate) : null,
      data.parentId,
      data.color || DEFAULT_TASK_COLOR,
    )

    task.id = data.id
    task.notes = data.notes || ""
    task.links = data.links || []
    task.attachments = data.attachments || []
    task.isCompleted = data.isCompleted || false
    task.createdAt = new Date(data.createdAt)
    task.updatedAt = new Date(data.updatedAt)

    if (data.messages) {
      task.messages = data.messages.map((msgData: any) => ({
        ...msgData,
        timestamp: new Date(msgData.timestamp),
      }))
    }

    if (data.subtasks) {
      task.subtasks = data.subtasks.map((subtaskData: any) => this.deserializeTask(subtaskData))
    }

    return task
  }

  public getTaskStats() {
    this.ensureInitialized()
    const totalTasks = this.tasks.length
    const completedTasks = this.tasks.filter((task) => task.isCompleted).length
    const overdueTasks = this.getOverdueTasks().length
    const upcomingTasks = this.getUpcomingTasks().length

    return {
      total: totalTasks,
      completed: completedTasks,
      overdue: overdueTasks,
      upcoming: upcomingTasks,
      completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
    }
  }
}
