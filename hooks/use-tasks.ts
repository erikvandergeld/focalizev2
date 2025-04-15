"use client"

import { useState, useEffect, useCallback } from "react"
import { getTasks, createTask, updateTask, deleteTask, updateTaskStatus } from "@/services/task-service"
import type { Task } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export function useTasks(projectId?: number | string, filters?: Record<string, any>) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTasks(projectId, filters)
      setTasks(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar tarefas")
      console.error("Erro ao buscar tarefas:", err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, filters])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const addTask = useCallback(
    async (taskData: Partial<Task>) => {
      try {
        const result = await createTask(taskData)
        toast({
          title: "Tarefa criada",
          description: "A tarefa foi criada com sucesso.",
        })
        await fetchTasks() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar tarefa",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchTasks, toast],
  )

  const editTask = useCallback(
    async (id: number | string, taskData: Partial<Task>) => {
      try {
        const result = await updateTask(id, taskData)
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        })
        await fetchTasks() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao atualizar tarefa",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchTasks, toast],
  )

  const changeTaskStatus = useCallback(
    async (id: number | string, statusId: number | string) => {
      try {
        const result = await updateTaskStatus(id, statusId)
        toast({
          title: "Status atualizado",
          description: "O status da tarefa foi atualizado com sucesso.",
        })
        await fetchTasks() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao atualizar status da tarefa",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchTasks, toast],
  )

  const removeTask = useCallback(
    async (id: number | string) => {
      try {
        const result = await deleteTask(id)
        toast({
          title: "Tarefa excluída",
          description: "A tarefa foi excluída com sucesso.",
        })
        await fetchTasks() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao excluir tarefa",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchTasks, toast],
  )

  return {
    tasks,
    isLoading,
    error,
    fetchTasks,
    addTask,
    editTask,
    changeTaskStatus,
    removeTask,
  }
}
