"use client"

import { useState, useEffect, useCallback } from "react"
import { getClients, createClient, updateClient, deleteClient } from "@/services/client-service"
import type { Client } from "@/services/client-service"
import { useToast } from "@/components/ui/use-toast"

export function useClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchClients = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getClients()
      setClients(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar clientes")
      console.error("Erro ao buscar clientes:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchClients()
  }, [fetchClients])

  const addClient = useCallback(
    async (clientData: Partial<Client>) => {
      try {
        const result = await createClient(clientData)
        toast({
          title: "Cliente criado",
          description: "O cliente foi criado com sucesso.",
        })
        await fetchClients() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar cliente",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchClients, toast],
  )

  const editClient = useCallback(
    async (id: number | string, clientData: Partial<Client>) => {
      try {
        const result = await updateClient(id, clientData)
        toast({
          title: "Cliente atualizado",
          description: "O cliente foi atualizado com sucesso.",
        })
        await fetchClients() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao atualizar cliente",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchClients, toast],
  )

  const removeClient = useCallback(
    async (id: number | string) => {
      try {
        const result = await deleteClient(id)
        toast({
          title: "Cliente excluído",
          description: "O cliente foi excluído com sucesso.",
        })
        await fetchClients() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao excluir cliente",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchClients, toast],
  )

  return {
    clients,
    isLoading,
    error,
    fetchClients,
    addClient,
    editClient,
    removeClient,
  }
}
