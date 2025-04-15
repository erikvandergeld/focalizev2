"use client"

import { useState, useEffect, useCallback } from "react"
import { getTags, createTag, updateTag, deleteTag } from "@/services/tag-service"
import type { Tag } from "@/services/tag-service"
import { useToast } from "@/components/ui/use-toast"

export function useTags() {
  const [tags, setTags] = useState<Tag[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchTags = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await getTags()
      setTags(data)
    } catch (err: any) {
      setError(err.message || "Erro ao carregar tags")
      console.error("Erro ao buscar tags:", err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTags()
  }, [fetchTags])

  const addTag = useCallback(
    async (tagData: Partial<Tag>) => {
      try {
        const result = await createTag(tagData)
        toast({
          title: "Tag criada",
          description: "A tag foi criada com sucesso.",
        })
        await fetchTags() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao criar tag",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchTags, toast],
  )

  const editTag = useCallback(
    async (id: number | string, tagData: Partial<Tag>) => {
      try {
        const result = await updateTag(id, tagData)
        toast({
          title: "Tag atualizada",
          description: "A tag foi atualizada com sucesso.",
        })
        await fetchTags() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao atualizar tag",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchTags, toast],
  )

  const removeTag = useCallback(
    async (id: number | string) => {
      try {
        const result = await deleteTag(id)
        toast({
          title: "Tag excluída",
          description: "A tag foi excluída com sucesso.",
        })
        await fetchTags() // Atualizar a lista
        return result
      } catch (err: any) {
        toast({
          title: "Erro",
          description: err.message || "Erro ao excluir tag",
          variant: "destructive",
        })
        throw err
      }
    },
    [fetchTags, toast],
  )

  return {
    tags,
    isLoading,
    error,
    fetchTags,
    addTag,
    editTag,
    removeTag,
  }
}
