"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useNotifications } from "./notification-provider"

// Dados de exemplo para projetos
const projectsData: Record<string, any> = {}

interface ProjectFormProps {
  projectId?: string
}

export function ProjectForm({ projectId }: ProjectFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [client, setClient] = useState("")
  const [entity, setEntity] = useState("")
  const [status, setStatus] = useState("pending")
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(!!projectId)
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  // Substituir dados de exemplo por estados
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string; entities: string[] }[]>([])
  const [availableEntities, setAvailableEntities] = useState<{ id: string; name: string }[]>([])

  // Adicionar useEffect para carregar dados
  useEffect(() => {
    // Em um sistema real, isso seria uma chamada à API
    const loadData = async () => {
      // Simulação de carregamento de dados
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Deixamos vazio para ser preenchido pelo backend
      setAvailableClients([])
      setAvailableEntities([])
    }

    loadData()
  }, [])

  // Carregar dados do projeto se estiver editando
  useEffect(() => {
    if (projectId) {
      const loadProject = async () => {
        try {
          // Simulação de carregamento de dados
          await new Promise((resolve) => setTimeout(resolve, 500))

          const project = projectsData[projectId as keyof typeof projectsData]
          if (project) {
            setName(project.name)
            setDescription(project.description)
            setClient(project.client)
            setEntity(project.entity)
            setStatus(project.status)
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar projeto",
            description: "Não foi possível carregar os dados do projeto.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingData(false)
        }
      }

      loadProject()
    }
  }, [projectId, toast])

  // Filtrar clientes com base na entidade selecionada
  const filteredClients = entity ? availableClients.filter((c) => c.entities.includes(entity)) : availableClients

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Encontrar o nome do cliente pelo ID
      const clientName = availableClients.find((c) => c.id === client)?.name || "Cliente"
      const entityName = availableEntities.find((e) => e.id === entity)?.name || "Entidade"

      if (projectId) {
        toast({
          title: "Projeto atualizado com sucesso",
          description: "As informações do projeto foram atualizadas.",
        })

        // Adicionar notificação
        addNotification(
          "Projeto atualizado",
          `O projeto "${name}" para o cliente ${clientName} foi atualizado com sucesso.`,
        )

        router.push(`/dashboard/projects/${projectId}`)
      } else {
        toast({
          title: "Projeto criado com sucesso",
          description: "O projeto foi adicionado ao sistema.",
        })

        // Adicionar notificação
        addNotification(
          "Novo projeto criado",
          `O projeto "${name}" para o cliente ${clientName} foi criado com sucesso pela ${entityName}.`,
        )

        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: projectId ? "Erro ao atualizar projeto" : "Erro ao criar projeto",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return <div className="flex justify-center p-4">Carregando...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome do Projeto</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="entity">Entidade Responsável</Label>
          <Select
            value={entity}
            onValueChange={(value) => {
              setEntity(value)
              // Resetar cliente quando a entidade muda
              setClient("")
            }}
            required
          >
            <SelectTrigger id="entity">
              <SelectValue placeholder="Selecione uma entidade" />
            </SelectTrigger>
            <SelectContent>
              {availableEntities.length > 0 ? (
                availableEntities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhuma entidade disponível. Adicione entidades nas configurações.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="client">Cliente</Label>
          <Select value={client} onValueChange={setClient} required disabled={!entity}>
            <SelectTrigger id="client">
              <SelectValue placeholder={entity ? "Selecione um cliente" : "Selecione uma entidade primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhum cliente disponível. Adicione clientes primeiro.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus} required>
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in-progress">Em andamento</SelectItem>
              <SelectItem value="completed">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : projectId ? "Atualizar projeto" : "Criar projeto"}
        </Button>
      </div>
    </form>
  )
}
