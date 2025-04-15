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
import { PlusCircle } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Tag } from "lucide-react"

export function TaskForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [client, setClient] = useState("")
  const [assignee, setAssignee] = useState("")
  const [status, setStatus] = useState("pending")
  const [taskType, setTaskType] = useState("technical") // Alterado de isAdministrative para taskType
  const [entity, setEntity] = useState("")
  const [project, setProject] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  // Substituir dados de exemplo por estados
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string; entities: string[] }[]>([])
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string; entities: string[] }[]>([])
  const [availableEntities, setAvailableEntities] = useState<{ id: string; name: string }[]>([])
  const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string; entity: string }[]>([])
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([])

  // Adicionar useEffect para carregar dados
  useEffect(() => {
    // Em um sistema real, isso seria uma chamada à API
    const loadData = async () => {
      // Simulação de carregamento de dados
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Deixamos vazio para ser preenchido pelo backend
      setAvailableClients([])
      setAvailableUsers([])
      setAvailableEntities([])
      setAvailableProjects([])
      setAvailableTags([])
    }

    loadData()
  }, [])

  // Filtrar usuários com base na entidade selecionada
  const filteredUsers = entity ? availableUsers.filter((user) => user.entities.includes(entity)) : availableUsers

  // Filtrar clientes com base na entidade selecionada
  const filteredClients = entity
    ? availableClients.filter((client) => client.entities.includes(entity))
    : availableClients

  // Filtrar projetos com base na entidade selecionada
  const filteredProjects = entity ? availableProjects.filter((project) => project.entity === entity) : availableProjects

  const handleCreateProject = () => {
    if (newProjectName.trim() && entity) {
      // Em um sistema real, aqui seria feita uma chamada à API para criar o projeto
      toast({
        title: "Projeto criado",
        description: `O projeto "${newProjectName}" foi criado com sucesso.`,
      })

      // Simular a criação do projeto
      const newProjectId = `project-${Date.now()}`
      setProject(newProjectId)

      setNewProjectName("")
      setNewProjectDialogOpen(false)
    }
  }

  const handleTagChange = (tagId: string) => {
    setSelectedTags((prev) => (prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Encontrar o nome do cliente pelo ID
      const clientName = availableClients.find((c) => c.id === client)?.name || "Cliente"
      const entityName = availableEntities.find((e) => e.id === entity)?.name || "Entidade"

      toast({
        title: "Tarefa criada com sucesso",
        description: "A tarefa foi adicionada ao quadro Kanban.",
      })

      // Adicionar notificação
      addNotification(
        "Nova tarefa criada",
        `A tarefa "${title}" para o cliente ${clientName} foi criada com sucesso pela ${entityName}.`,
      )

      router.push("/dashboard")
    } catch (error) {
      toast({
        title: "Erro ao criar tarefa",
        description: "Ocorreu um erro ao criar a tarefa. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="title">Título</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
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
              // Resetar cliente e responsável quando a entidade muda
              setClient("")
              setAssignee("")
              setProject("")
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <Label htmlFor="assignee">Responsável</Label>
            <Select value={assignee} onValueChange={setAssignee} required disabled={!entity}>
              <SelectTrigger id="assignee">
                <SelectValue placeholder={entity ? "Selecione um responsável" : "Selecione uma entidade primeiro"} />
              </SelectTrigger>
              <SelectContent>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-2 text-sm text-muted-foreground">
                    Nenhum usuário disponível. Adicione usuários primeiro.
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="project">Projeto</Label>
            <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" className="gap-1" disabled={!entity}>
                  <PlusCircle className="h-4 w-4" />
                  Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Projeto</DialogTitle>
                  <DialogDescription>
                    Preencha o nome do novo projeto para a entidade{" "}
                    {availableEntities.find((e) => e.id === entity)?.name}.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="projectName">Nome do Projeto</Label>
                    <Input
                      id="projectName"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Digite o nome do projeto"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleCreateProject} disabled={!newProjectName.trim()}>
                    Criar Projeto
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Select value={project} onValueChange={setProject} disabled={!entity}>
            <SelectTrigger id="project">
              <SelectValue
                placeholder={entity ? "Selecione um projeto (opcional)" : "Selecione uma entidade primeiro"}
              />
            </SelectTrigger>
            <SelectContent>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhum projeto disponível. Crie um novo projeto.
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
              <SelectItem value="completed">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="task-type">Tipo de Tarefa</Label>
          <Select value={taskType} onValueChange={setTaskType} required>
            <SelectTrigger id="task-type">
              <SelectValue placeholder="Selecione o tipo de tarefa" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Técnica</SelectItem>
              <SelectItem value="administrative">Administrativa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 border rounded-md p-3">
            {availableTags.length > 0 ? (
              availableTags.map((tag) => (
                <span
                  key={tag.id}
                  onClick={() => handleTagChange(tag.id)}
                  className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
                    selectedTags.includes(tag.id) ? "ring-2 ring-offset-1" : ""
                  }`}
                  style={{
                    backgroundColor: tag.color,
                    color: "white",
                  }}
                >
                  <Tag className="h-3 w-3" />
                  {tag.name}
                </span>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Nenhuma tag disponível. Adicione tags nas configurações.</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : "Salvar tarefa"}
        </Button>
      </div>
    </form>
  )
}
