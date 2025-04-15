// Tipos básicos para a aplicação

export interface User {
  id: number | string
  username: string
  email: string
  full_name: string
  role: string
  created_at: string
  updated_at?: string
  is_active: boolean
}

export interface Project {
  id: number | string
  name: string
  description?: string
  status: string
  start_date?: string
  end_date?: string
  created_at: string
  updated_at?: string
  created_by?: number | string
  owner?: User
  entities?: Entity[]
}

export interface ProjectMember {
  id?: number | string
  project_id: number | string
  user_id: number | string
  role: string
  created_at?: string
  user?: User
}

export interface Task {
  id: number | string
  title: string
  description?: string
  status: string
  priority: string
  due_date?: string
  project_id?: number | string
  assigned_to?: number | string
  created_by?: number | string
  created_at: string
  updated_at?: string
  completed_at?: string
  project?: Project
  assignee?: User
  creator?: User
  tags?: Tag[]
  subtasks?: Subtask[]
}

export interface Subtask {
  id: number | string
  task_id: number | string
  title: string
  is_completed: boolean
  created_at: string
  updated_at?: string
}

export interface Comment {
  id: number | string
  task_id: number | string
  user_id: number | string
  text: string
  created_at: string
  updated_at?: string
  user?: User
}

export interface Category {
  id: number | string
  name: string
  color: string
  created_at: string
  updated_at?: string
}

export interface Entity {
  id: number | string
  name: string
  description?: string
  created_at: string
  updated_at?: string
  created_by?: number | string
  is_active: boolean
}

export interface Tag {
  id: number | string
  name: string
  color: string
  created_at: string
  updated_at?: string
}

export interface TaskFilter {
  status?: string
  priority?: string
  assigned_to?: number | string
  due_date_start?: string
  due_date_end?: string
  search?: string
  tags?: (number | string)[]
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  status?: number
}
