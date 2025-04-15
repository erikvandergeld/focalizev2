"use client"

import { useState, useEffect, useCallback } from "react"
import { getTasks, createTask, updateTask, deleteTask } from "@/services/task-service"
import type { Task } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export function useTasks(projectId?: number | string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTasks = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTasks(projectId)
      setTasks(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar tarefas")
      console.error("Error fetching tasks:", err)
    } finally {
      setIsLoading(false)
    }
  }, [projectId])

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
        await fetchTasks() // Refresh the list
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
    async (id: number, taskData: Partial<Task>) => {
      try {
        const result = await updateTask(id, taskData)
        toast({
          title: "Tarefa atualizada",
          description: "A tarefa foi atualizada com sucesso.",
        })
        await fetchTasks() // Refresh the list
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

  const removeTask = useCallback(
    async (id: number) => {
      try {
        const result = await deleteTask(id)
        toast({
          title: "Tarefa excluída",
          description: "A tarefa foi excluída com sucesso.",
        })
        await fetchTasks() // Refresh the list
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
    removeTask,
  }
}
