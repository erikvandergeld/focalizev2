"use client"

import { useState, useEffect, useCallback } from "react"
import { getUsers, createUser, updateUser, deleteUser } from "@/services/user-service"
import type { User } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export function useUsers() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getUsers()
      setUsers(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar usuários")
      console.error("Erro ao buscar usuários:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const addUser = useCallback(
    async (userData: Partial<User>) => {
      try {
        const result = await createUser(userData)
        toast({
          title: "Usuário criado",
          description: "O usuário foi criado com sucesso.",
        })
        await fetchUsers() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar usuário",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchUsers, toast],
  )

  const editUser = useCallback(
    async (id: number | string, userData: Partial<User>) => {
      try {
        const result = await updateUser(id, userData)
        toast({
          title: "Usuário atualizado",
          description: "O usuário foi atualizado com sucesso.",
        })
        await fetchUsers() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao atualizar usuário",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchUsers, toast],
  )

  const removeUser = useCallback(
    async (id: number | string) => {
      try {
        const result = await deleteUser(id)
        toast({
          title: "Usuário excluído",
          description: "O usuário foi excluído com sucesso.",
        })
        await fetchUsers() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao excluir usuário",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchUsers, toast],
  )

  return {
    users,
    isLoading,
    error,
    fetchUsers,
    addUser,
    editUser,
    removeUser,
  }
}
