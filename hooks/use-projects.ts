"use client"

import { useState, useEffect, useCallback } from "react"
import { getProjects, createProject, updateProject, deleteProject } from "@/services/project-service"
import type { Project } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getProjects()
      setProjects(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar projetos")
      console.error("Erro ao buscar projetos:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])

  const addProject = useCallback(
    async (projectData: Partial<Project>) => {
      try {
        const result = await createProject(projectData)
        toast({
          title: "Projeto criado",
          description: "O projeto foi criado com sucesso.",
        })
        await fetchProjects() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar projeto",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchProjects, toast],
  )

  const editProject = useCallback(
    async (id: number | string, projectData: Partial<Project>) => {
      try {
        const result = await updateProject(id, projectData)
        toast({
          title: "Projeto atualizado",
          description: "O projeto foi atualizado com sucesso.",
        })
        await fetchProjects() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao atualizar projeto",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchProjects, toast],
  )

  const removeProject = useCallback(
    async (id: number | string) => {
      try {
        const result = await deleteProject(id)
        toast({
          title: "Projeto excluído",
          description: "O projeto foi excluído com sucesso.",
        })
        await fetchProjects() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao excluir projeto",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchProjects, toast],
  )

  return {
    projects,
    isLoading,
    error,
    fetchProjects,
    addProject,
    editProject,
    removeProject,
  }
}
