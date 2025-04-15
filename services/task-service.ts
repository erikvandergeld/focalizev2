import { api } from "./api-service"
import type { Task, Subtask, Category } from "@/types"

export async function getTasks(projectId?: number | string): Promise<Task[]> {
  const endpoint = projectId ? `/tasks?project_id=${projectId}` : "/tasks"
  return await api.get(endpoint)
}

export async function getTask(id: number | string): Promise<Task> {
  return await api.get(`/tasks/${id}`)
}

export async function createTask(data: Partial<Task>): Promise<{ message: string; taskId: number }> {
  return await api.post("/tasks", data)
}

export async function updateTask(id: number | string, data: Partial<Task>): Promise<{ message: string }> {
  return await api.put(`/tasks/${id}`, data)
}

export async function deleteTask(id: number | string): Promise<{ message: string }> {
  return await api.delete(`/tasks/${id}`)
}

export async function getTaskCategories(taskId: number | string): Promise<Category[]> {
  return await api.get(`/tasks/${taskId}/categories`)
}

export async function getTaskSubtasks(taskId: number | string): Promise<Subtask[]> {
  return await api.get(`/tasks/${taskId}/subtasks`)
}

export async function createSubtask(
  taskId: number | string,
  data: Partial<Subtask>,
): Promise<{ message: string; subtaskId: number }> {
  return await api.post(`/tasks/${taskId}/subtasks`, data)
}

export async function updateSubtask(
  taskId: number | string,
  subtaskId: number | string,
  data: Partial<Subtask>,
): Promise<{ message: string }> {
  return await api.put(`/tasks/${taskId}/subtasks/${subtaskId}`, data)
}

export async function deleteSubtask(taskId: number | string, subtaskId: number | string): Promise<{ message: string }> {
  return await api.delete(`/tasks/${taskId}/subtasks/${subtaskId}`)
}

export async function completeSubtask(
  taskId: number | string,
  subtaskId: number | string,
): Promise<{ message: string }> {
  return await api.put(`/tasks/${taskId}/subtasks/${subtaskId}/complete`, {})
}

export async function uncompleteSubtask(
  taskId: number | string,
  subtaskId: number | string,
): Promise<{ message: string }> {
  return await api.put(`/tasks/${taskId}/subtasks/${subtaskId}/uncomplete`, {})
}
