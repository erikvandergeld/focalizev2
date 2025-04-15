import { api } from "./api-service"
import type { Project, ProjectMember } from "@/types"

export async function getProjects(): Promise<Project[]> {
  try {
    return await api.get("/projects")
  } catch (error) {
    console.error("Erro ao buscar projetos:", error)
    return []
  }
}

export async function getProject(id: number | string): Promise<Project> {
  return await api.get(`/projects/${id}`)
}

export async function createProject(data: Partial<Project>): Promise<{ message: string; projectId: number }> {
  return await api.post("/projects", data)
}

export async function updateProject(id: number | string, data: Partial<Project>): Promise<{ message: string }> {
  return await api.put(`/projects/${id}`, data)
}

export async function deleteProject(id: number | string): Promise<{ message: string }> {
  return await api.delete(`/projects/${id}`)
}

export async function getProjectMembers(projectId: number | string): Promise<ProjectMember[]> {
  try {
    return await api.get(`/projects/${projectId}/members`)
  } catch (error) {
    console.error(`Erro ao buscar membros do projeto ${projectId}:`, error)
    return []
  }
}

export async function addProjectMember(
  projectId: number | string,
  userId: number | string,
  role = "member",
): Promise<{ message: string }> {
  return await api.post(`/projects/${projectId}/members`, { userId, role })
}

export async function removeProjectMember(
  projectId: number | string,
  userId: number | string,
): Promise<{ message: string }> {
  return await api.delete(`/projects/${projectId}/members/${userId}`)
}

export async function updateProjectMemberRole(
  projectId: number | string,
  userId: number | string,
  role: string,
): Promise<{ message: string }> {
  return await api.put(`/projects/${projectId}/members/${userId}`, { role })
}
