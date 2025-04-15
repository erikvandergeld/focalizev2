import { api } from "./api-service"
import type { Entity } from "@/types"

export async function getEntities(): Promise<Entity[]> {
  try {
    return await api.get("/entities")
  } catch (error) {
    console.error("Erro ao buscar entidades:", error)
    return []
  }
}

export async function getEntity(id: number | string): Promise<Entity> {
  return await api.get(`/entities/${id}`)
}

export async function createEntity(data: Partial<Entity>): Promise<{ message: string; entityId: number }> {
  return await api.post("/entities", data)
}

export async function updateEntity(id: number | string, data: Partial<Entity>): Promise<{ message: string }> {
  return await api.put(`/entities/${id}`, data)
}

export async function deleteEntity(id: number | string): Promise<{ message: string }> {
  return await api.delete(`/entities/${id}`)
}

export async function getProjectEntities(projectId: number | string): Promise<Entity[]> {
  try {
    return await api.get(`/projects/${projectId}/entities`)
  } catch (error) {
    console.error(`Erro ao buscar entidades do projeto ${projectId}:`, error)
    return []
  }
}

export async function addEntityToProject(
  projectId: number | string,
  entityId: number | string,
): Promise<{ message: string }> {
  return await api.post(`/projects/${projectId}/entities`, { entityId })
}

export async function removeEntityFromProject(
  projectId: number | string,
  entityId: number | string,
): Promise<{ message: string }> {
  return await api.delete(`/projects/${projectId}/entities/${entityId}`)
}
