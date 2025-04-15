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

// Dados de exemplo
const clients = [
  { id: "1", name: "Acme Inc" },
  { id: "2", name: "TechCorp" },
  { id: "3", name: "WebSolutions" },
  { id: "4", name: "DataSys" },
]

const users = [
  { id: "1", name: "João Silva" },
  { id: "2", name: "Maria Souza" },
  { id: "3", name: "Pedro Santos" },
  { id: "4", name: "Ana Oliveira" },
]

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
  const [client, setClient] = useState("")
  const [assignee, setAssignee] = useState("")
  const [status, setStatus] = useState("")
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  // Add a function to check if the user can edit the task
  const canEditTask = () => {
    // In a real system, you would check user permissions
    // For now, only the assignee can edit the task
    return user?.name === task.assignee
  }

  useEffect(() => {
    if (task) {
      setTitle(task.title)
      setDescription(task.description)
      setClient(task.client)
      setAssignee(task.assignee)
      setStatus(task.status)
    }
  }, [task])

  const handleSubmit = () => {
    // Check if the user has permission to edit the task
    if (!canEditTask()) {
      addNotification(
        "Permissão negada",
        "Você não tem permissão para editar esta tarefa. Apenas o responsável pode fazer isso.",
      )
      onOpenChange(false)
      return
    }

    const updatedTask = {
      ...task,
      title,
      description,
      client,
      assignee,
      status,
    }

    onSave(task.id, updatedTask)

    addNotification(
      "Tarefa atualizada",
      `A tarefa "${title}" para o cliente ${clients.find((c) => c.name === client)?.name || client} foi atualizada.`,
    )

    onOpenChange(false)
  }

  // Add a useEffect to show a notification and close the dialog if the user doesn't have permission
  useEffect(() => {
    if (open && task && !canEditTask()) {
      addNotification(
        "Permissão negada",
        "Você não tem permissão para editar esta tarefa. Apenas o responsável pode fazer isso.",
      )
      onOpenChange(false)
    }
  }, [open, task, addNotification, onOpenChange])

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
                    <SelectItem key={c.id} value={c.name}>
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
                  {users.map((user) => (
                    <SelectItem key={user.id} value={user.name}>
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
