// User types
export interface User {
  id: number
  username: string
  email: string
  full_name: string
  role: "admin" | "manager" | "member"
  created_at: string
  updated_at: string
  is_active: boolean
}

// Project types
export interface Project {
  id: number
  name: string
  description: string | null
  color: string | null
  owner_id: number
  created_at: string
  updated_at: string
}

export interface ProjectMember {
  project_id: number
  user_id: number
  role: "owner" | "admin" | "member" | "viewer"
  joined_at: string
  // Additional user info
  username?: string
  email?: string
  full_name?: string
}

// Task types
export interface TaskStatus {
  id: number
  name: string
  color: string | null
  position: number
  project_id: number
  is_default: boolean
}

export interface Category {
  id: number
  name: string
  color: string | null
  project_id: number
}

export interface Priority {
  id: number
  name: string
  color: string | null
  value: number
  project_id: number
}

export interface Task {
  id: number
  title: string
  description: string | null
  project_id: number
  status_id: number
  priority_id: number | null
  assignee_id: number | null
  reporter_id: number
  due_date: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  position: number
  // Additional info
  status?: TaskStatus
  priority?: Priority
  assignee?: User
  reporter?: User
  categories?: Category[]
  subtasks?: Subtask[]
}

export interface Subtask {
  id: number
  task_id: number
  title: string
  is_completed: boolean
  position: number
  created_at: string
  completed_at: string | null
}

// Comment type for the UI
export interface Comment {
  id: string
  text: string
  author: string
  createdAt: Date
}
