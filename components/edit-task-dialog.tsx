"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useNotifications } from "./notification-provider"
import { useAuth } from "./auth-provider"

interface EditTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task: {
    id: string
    title: string
    description: string
    client: string
    assignee: string
    status: string
  }
  onSave: (taskId: string, updatedTask: any) => void
}

export function EditTaskDialog({ open, onOpenChange, task, onSave }: EditTaskDialogProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [client, setClient] = useState("") // O ID do cliente será armazenado aqui
  const [assignee, setAssignee] = useState("")
  const [status, setStatus] = useState("")
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])

  // Carregar os dados de clientes e usuários
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }

        const [cliRes, userRes] = await Promise.all([fetch("/api/clientes", { headers }), fetch("/api/usuarios", { headers })])

        const clientes = await cliRes.json()
        const usuarios = await userRes.json()

        setClients(clientes.clientes || [])
        setUsers((usuarios.usuarios || []).map((u: any) => ({ id: u.id, name: `${u.firstName} ${u.lastName}`.trim() })))
      } catch (error) {
        console.error("Erro ao carregar dados de edição:", error)
      }
    }

    fetchData()
  }, [])

  // Inicializar os campos com os dados da tarefa, mas apenas se os campos ainda não estiverem preenchidos
  // useEffect(() => {
  //   if (task) {
  //     setTitle(task.title)
  //     setDescription(task.description)
  //     setClient(task.client) // Aqui, o client é o ID
  //     setAssignee(task.assignee)
  //     setStatus(task.status)
  //   }
  // }, [task])

  const filteredUsers = users.filter((u) => !!u.name?.trim())

  const handleSubmit = async () => {
    const updatedTask = {
      ...task,
      title,
      description,
      client, // Aqui, o client vai ser o ID
      assignee,
      status,
    }

    try {
      await onSave(task.id, updatedTask) // Chama a função onSave que envia a requisição
      addNotification("Tarefa atualizada", `A tarefa "${title}" foi atualizada com sucesso pelo usuário ${user?.name}.`)
      onOpenChange(false) // Fecha o diálogo
    } catch (error) {
      addNotification("Erro ao atualizar tarefa", `O usuário ${user?.name} não tem permissão para editar essa tarefa.", "destructive`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
          <DialogDescription>Faça alterações na tarefa e salve quando terminar.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client">Cliente</Label>
              <Select value={client} onValueChange={setClient}>
                <SelectTrigger id="client">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((c) => (
                    <SelectItem key={c.id} value={c.id}> {/* Usando o ID como valor */}
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignee">Responsável</Label>
              <Select value={assignee} onValueChange={setAssignee}>
                <SelectTrigger id="assignee">
                  <SelectValue placeholder="Selecione um responsável" />
                </SelectTrigger>
                <SelectContent>
                  {filteredUsers.map((user) => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
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
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>Salvar alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
