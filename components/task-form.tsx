"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { useNotifications } from "./notification-provider"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { PlusCircle, Tag } from "lucide-react"

export function TaskForm() {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [client, setClient] = useState("")
  const [assignee, setAssignee] = useState("")
  const [status, setStatus] = useState("pending")
  const [taskType, setTaskType] = useState("technical")
  const [entity, setEntity] = useState("")
  const [project, setProject] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [newProjectName, setNewProjectName] = useState("")
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const [availableClients, setAvailableClients] = useState<{ id: string; name: string; entities: string[] }[]>([])
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string; entities: string[] }[]>([])
  const [availableEntities, setAvailableEntities] = useState<{ id: string; name: string }[]>([])
  const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string; entity: string }[]>([])
  const [availableTags, setAvailableTags] = useState<{ id: string; name: string; color: string }[]>([])

  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  useEffect(() => {
    const token = localStorage.getItem("token")
    const headers = { Authorization: `Bearer ${token}` }

    const loadData = async () => {
      try {
        const [entRes, cliRes, userRes, projRes, tagRes] = await Promise.all([
          fetch("/api/entidades", { headers }),
          fetch("/api/clientes", { headers }),
          fetch("/api/usuarios", { headers }),
          fetch("/api/projetos", { headers }),
          fetch("/api/tags", { headers }),
        ])

        console.log(projRes);

        const [entidades, clientes, usuarios, projetos, tags] = await Promise.all([
          entRes.json(),
          cliRes.json(),
          userRes.json(),
          projRes.json(),
          tagRes.json(),
        ])



        setAvailableEntities(entidades.entidades ?? [])
        setAvailableClients(clientes.clientes ?? [])
        setAvailableUsers((usuarios.usuarios || []).map((u: any) => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`.trim(),
          entities: u.entities || []
        })))
        setAvailableProjects(projetos.projetos ?? [])
        setAvailableTags(tags.tags ?? [])
      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    loadData()
  }, [])


  
  const filteredUsers = entity ? availableUsers.filter((u) => u.entities.includes(entity)) : []
  const filteredClients = entity ? availableClients.filter((c) => c.entities.includes(entity)) : []
  //Observação: Campo de projetos não é exibido porque não existe o atributo "entidade" vinculado ao projeto. Correção: CORRIGIDO.
  const filteredProjects = entity ? availableProjects.filter((p) => p.entity === entity) : []



  const handleTagChange = (tagId: string) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    )
  }

  const handleCreateProject = () => {
    if (newProjectName.trim() && entity) {
      const newProjectId = `project-${Date.now()}`
      setProject(newProjectId)
      toast({ title: "Projeto criado", description: `O projeto "${newProjectName}" foi criado.` })
      setNewProjectName("")
      setNewProjectDialogOpen(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const token = localStorage.getItem("token")
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    const payload = {
      title,
      description,
      client,
      assignee,
      entity,
      project,
      status,
      taskType,
      tags: selectedTags,
    }

    try {
      const res = await fetch("/api/tarefas", {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      })
      const data = await res.json()

      if (!res.ok || !data.success) throw new Error(data.message)

      toast({ title: "Tarefa criada com sucesso" })
      addNotification("Nova tarefa", `A tarefa "${title}" foi criada.`)
      router.push("/dashboard")
    } catch (error) {
      toast({ title: "Erro ao salvar", description: "Não foi possível salvar a tarefa.", variant: "destructive" })
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
          <Label htmlFor="entity">Entidade</Label>
          <Select value={entity} onValueChange={(val) => {
            setEntity(val)
            setClient("")
            setAssignee("")
            setProject("")
          }}>
            <SelectTrigger><SelectValue placeholder="Selecione uma entidade" /></SelectTrigger>
            <SelectContent>
              {availableEntities.map(ent => (
                <SelectItem key={ent.id} value={ent.id}>{ent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label>Cliente</Label>
            <Select value={client} onValueChange={setClient} disabled={!entity}>
              <SelectTrigger><SelectValue placeholder="Selecione um cliente" /></SelectTrigger>
              <SelectContent>
                {filteredClients.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Responsável</Label>
            <Select value={assignee} onValueChange={setAssignee} disabled={!entity}>
              <SelectTrigger><SelectValue placeholder="Selecione um responsável" /></SelectTrigger>
              <SelectContent>
                {filteredUsers.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <div className="flex justify-between items-center">
            <Label>Projeto</Label>
            <Dialog open={newProjectDialogOpen} onOpenChange={setNewProjectDialogOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" size="sm" disabled={!entity}>
                  <PlusCircle className="w-4 h-4 mr-1" /> Novo Projeto
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Novo Projeto</DialogTitle>
                  <DialogDescription>Crie um novo projeto para a entidade selecionada.</DialogDescription>
                </DialogHeader>
                <Input value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)} />
                <DialogFooter>
                  <Button type="button" onClick={() => setNewProjectDialogOpen(false)}>Cancelar</Button>
                  <Button type="button" onClick={handleCreateProject}>Criar</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
          <Select value={project} onValueChange={setProject} disabled={!entity}>
            <SelectTrigger><SelectValue placeholder="Selecione um projeto" /></SelectTrigger>
            <SelectContent>
              {filteredProjects.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Status</Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger><SelectValue placeholder="Selecione o status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in-progress">Em andamento</SelectItem>
              <SelectItem value="completed">Finalizada</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Tipo de Tarefa</Label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger><SelectValue placeholder="Selecione o tipo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="technical">Técnica</SelectItem>
              <SelectItem value="administrative">Administrativa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Tags</Label>
          <div className="flex flex-wrap gap-2 border rounded-md p-3">
            {availableTags.map(tag => (
              <span
                key={tag.id}
                onClick={() => handleTagChange(tag.id)}
                className={`px-2 py-0.5 rounded-full text-xs font-medium cursor-pointer flex items-center gap-1.5 ${
                  selectedTags.includes(tag.id) ? "ring-2 ring-offset-1" : ""
                }`}
                style={{ backgroundColor: tag.color, color: "white" }}
              >
                <Tag className="h-3 w-3" />
                {tag.name}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={isLoading}>{isLoading ? "Salvando..." : "Salvar tarefa"}</Button>
      </div>
    </form>
  )
}
