"use client"

import { useState, useEffect, useCallback } from "react"
import { getEntities, createEntity, updateEntity, deleteEntity } from "@/services/entity-service"
import type { Entity } from "@/types"
import { useToast } from "@/components/ui/use-toast"

export function useEntities() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchEntities = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getEntities()
      setEntities(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar entidades")
      console.error("Erro ao buscar entidades:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchEntities()
  }, [fetchEntities])

  const addEntity = useCallback(
    async (entityData: Partial<Entity>) => {
      try {
        const result = await createEntity(entityData)
        toast({
          title: "Entidade criada",
          description: "A entidade foi criada com sucesso.",
        })
        await fetchEntities() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar entidade",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchEntities, toast],
  )

  const editEntity = useCallback(
    async (id: number | string, entityData: Partial<Entity>) => {
      try {
        const result = await updateEntity(id, entityData)
        toast({
          title: "Entidade atualizada",
          description: "A entidade foi atualizada com sucesso.",
        })
        await fetchEntities() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao atualizar entidade",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchEntities, toast],
  )

  const removeEntity = useCallback(
    async (id: number | string) => {
      try {
        const result = await deleteEntity(id)
        toast({
          title: "Entidade excluída",
          description: "A entidade foi excluída com sucesso.",
        })
        await fetchEntities() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao excluir entidade",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchEntities, toast],
  )

  return {
    entities,
    isLoading,
    error,
    fetchEntities,
    addEntity,
    editEntity,
    removeEntity,
  }
}
