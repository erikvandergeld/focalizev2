import { api } from "./api-service"

export interface Tag {
  id: number | string
  name: string
  color: string
  created_at: string
  updated_at?: string
}

export async function getTags(): Promise<Tag[]> {
  try {
    return await api.get("/tags")
  } catch (error) {
    console.error("Erro ao buscar tags:", error)
    return []
  }
}

export async function getTag(id: number | string): Promise<Tag> {
  return await api.get(`/tags/${id}`)
}

export async function createTag(data: Partial<Tag>): Promise<{ message: string; tagId: number }> {
  return await api.post("/tags", data)
}

export async function updateTag(id: number | string, data: Partial<Tag>): Promise<{ message: string }> {
  return await api.put(`/tags/${id}`, data)
}

export async function deleteTag(id: number | string): Promise<{ message: string }> {
  return await api.delete(`/tags/${id}`)
}
