import { api } from "./api-service"
import type { Task, Subtask, Category, Comment } from "@/types"

export async function getTasks(projectId?: number | string, filters?: Record<string, any>): Promise<Task[]> {
  try {
    let endpoint = "/tasks"

    // Adicionar parâmetros de consulta
    const queryParams = new URLSearchParams()

    if (projectId) {
      queryParams.append("project_id", projectId.toString())
    }

    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, value.toString())
        }
      })
    }

    const queryString = queryParams.toString()
    if (queryString) {
      endpoint += `?${queryString}`
    }

    return await api.get(endpoint)
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error)
    return []
  }
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

export async function updateTaskStatus(id: number | string, statusId: number | string): Promise<{ message: string }> {
  return await api.patch(`/tasks/${id}/status`, { status_id: statusId })
}

export async function getTaskComments(taskId: number | string): Promise<Comment[]> {
  try {
    return await api.get(`/tasks/${taskId}/comments`)
  } catch (error) {
    console.error(`Erro ao buscar comentários da tarefa ${taskId}:`, error)
    return []
  }
}

export async function addTaskComment(
  taskId: number | string,
  text: string,
): Promise<{ message: string; commentId: number }> {
  return await api.post(`/tasks/${taskId}/comments`, { text })
}

export async function getTaskCategories(taskId: number | string): Promise<Category[]> {
  try {
    return await api.get(`/tasks/${taskId}/categories`)
  } catch (error) {
    console.error(`Erro ao buscar categorias da tarefa ${taskId}:`, error)
    return []
  }
}

export async function getTaskSubtasks(taskId: number | string): Promise<Subtask[]> {
  try {
    return await api.get(`/tasks/${taskId}/subtasks`)
  } catch (error) {
    console.error(`Erro ao buscar subtarefas da tarefa ${taskId}:`, error)
    return []
  }
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
