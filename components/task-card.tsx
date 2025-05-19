"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Calendar, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ConfirmDialog } from "./confirm-dialog"
import { TaskForm } from "./task-form"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useToast } from "@/components/ui/use-toast"
import { useTasks } from "@/hooks/use-tasks"
import type { Task } from "@/types"

interface TaskCardProps {
  task: Task
  projectId?: number | string
}



export function TaskCard({ task, projectId }: TaskCardProps) {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { editTask, removeTask } = useTasks(projectId)
  const { toast } = useToast()

  const handleEditTask = async (taskData: Partial<Task>) => {
    setIsSubmitting(true)
    try {
      await editTask(task.id, taskData)
      setIsEditDialogOpen(false)
      toast({
        title: "Tarefa atualizada",
        description: "A tarefa foi atualizada com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao atualizar a tarefa.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteTask = async () => {
    try {
      await removeTask(task.id)
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi excluída com sucesso.",
      })
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao excluir a tarefa.",
        variant: "destructive", 
      })
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-green-100 text-green-800"
      case "medium":
        return "bg-blue-100 text-blue-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "urgent":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "canceled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendente"
      case "in_progress":
        return "Em Progresso"
      case "completed":
        return "Concluída"
      case "canceled":
        return "Cancelada"
      default:
        return status
    }
  }

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "low":
        return "Baixa"
      case "medium":
        return "Média"
      case "high":
        return "Alta"
      case "urgent":
        return "Urgente"
      default:
        return priority
    }
  }

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg">{task.title}</CardTitle>
            <div className="flex gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsEditDialogOpen(true)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-grow pb-2">
          {task.description && <p className="text-sm text-gray-600 mb-3">{task.description}</p>}

          <div className="flex flex-wrap gap-1 mb-3">
            <Badge variant="secondary" className={getStatusColor(task.status)}>
              {getStatusText(task.status)}
            </Badge>
            <Badge variant="secondary" className={getPriorityColor(task.priority)}>
              {getPriorityText(task.priority)}
            </Badge>
          </div>

          {task.tags && task.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {task.tags.map((tag) => (
                <Badge
                  key={tag.id}
                  style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }}
                  className="px-2 py-0.5"
                >
                  {tag.name}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="pt-2 flex flex-col items-start gap-2">
          {task.due_date && (
            <div className="flex items-center text-sm text-gray-500">
              <Calendar className="h-4 w-4 mr-1" />
              <span>{format(new Date(task.due_date), "dd/MM/yyyy", { locale: ptBR })}</span>
            </div>
          )}

          {typeof task.assignee === "object" && task.assignee?.full_name && (
            <div className="flex items-center">
              <Avatar className="h-6 w-6 mr-2">
                <AvatarImage
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(task.assignee.full_name)}&background=random`}
                />
                <AvatarFallback>
                  {task.assignee && typeof task.assignee === "object" && (
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback>
                          {task.assignee.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee.full_name}</span>
                    </div>
                  )}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{task.assignee.full_name}</span>
            </div>
          )}
        </CardFooter>
      </Card>

      {/* Diálogo de edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Tarefa</DialogTitle>
          </DialogHeader>
          <TaskForm
            task={{
              ...task,
              id: String(task.id),
              assignee:
                typeof task.assignee === "object" && task.assignee !== null
                  ? task.assignee.id
                  : task.assignee ?? "",
              client:
                typeof task.client === "object" && task.client !== null
                  ? task.client.id
                  : task.client ?? "",
              entity:
                typeof task.entity === "object" && task.entity !== null
                  ? task.entity.id
                  : task.entity ?? "",
              project:
                typeof task.project === "object" && task.project !== null
                  ? task.project.id
                  : task.project ?? "",
              tags: task.tags?.map(tag => ({
                id: String(tag.id),
                name: tag.name,
                color: tag.color
              })) ?? []
            }}
            projectId={projectId}
            onSubmit={handleEditTask}
            onCancel={() => setIsEditDialogOpen(false)}
            isSubmitting={isSubmitting}
          />

        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir tarefa"
        description={`Tem certeza que deseja excluir a tarefa "${task.title}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteTask}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </>
  )
}

// Função para determinar se o texto deve ser branco ou preto com base na cor de fundo
function getContrastColor(hexColor: string): string {
  // Remover o # se existir
  const color = hexColor.replace("#", "")

  // Converter para RGB
  const r = Number.parseInt(color.substr(0, 2), 16)
  const g = Number.parseInt(color.substr(2, 2), 16)
  const b = Number.parseInt(color.substr(4, 2), 16)

  // Calcular a luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Retornar branco ou preto com base na luminância
  return luminance > 0.5 ? "#000000" : "#ffffff"
}
