import { api } from "./api-service"
import type { User } from "@/types"

export async function getUsers(): Promise<User[]> {
  return await api.get("/users")
}

export async function getUser(id: number | string): Promise<User> {
  return await api.get(`/users/${id}`)
}

export async function updateUser(id: number | string, data: Partial<User>): Promise<{ message: string }> {
  return await api.put(`/users/${id}`, data)
}

export async function deleteUser(id: number | string): Promise<{ message: string }> {
  return await api.delete(`/users/${id}`)
}

export async function getUserProjects(userId: number | string): Promise<any[]> {
  return await api.get(`/users/${userId}/projects`)
}
