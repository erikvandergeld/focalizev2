"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MessageSquare } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNotifications } from "./notification-provider"
import { ConfirmDialog } from "./confirm-dialog"
import { CommentDialog, type Comment } from "./comment-dialog"
import { EditTaskDialog } from "./edit-task-dialog"

// Dados de exemplo com comentários
const tasks: any[] = []

export function TaskList({ projectId }: { projectId?: string }) {
  const router = useRouter()
  const { addNotification } = useNotifications()
  const [taskList, setTaskList] = useState(projectId ? tasks.filter((task) => task.project === projectId) : tasks)

  // Estados para os diálogos
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>
      case "in-progress":
        return <Badge variant="secondary">Em andamento</Badge>
      case "completed":
        return <Badge variant="default">Finalizada</Badge>
      default:
        return null
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Função para abrir o diálogo de comentários
  const handleOpenCommentDialog = (task: any) => {
    setSelectedTask(task)
    setCommentDialogOpen(true)
  }

  // Função para abrir o diálogo de edição
  const handleOpenEditDialog = (task: any) => {
    setSelectedTask(task)
    setEditDialogOpen(true)
  }

  // Função para abrir o diálogo de confirmação de exclusão
  const handleOpenDeleteDialog = (task: any) => {
    setSelectedTask(task)
    setDeleteDialogOpen(true)
  }

  // Função para adicionar um comentário
  const handleAddComment = (taskId: string, commentText: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      author: "Usuário Teste", // Em um sistema real, seria o usuário logado
      createdAt: new Date(),
    }

    const updatedTasks = taskList.map((task) => {
      if (task.id === taskId) {
        return {
          ...task,
          comments: [newComment, ...task.comments],
        }
      }
      return task
    })

    setTaskList(updatedTasks)
  }

  // const handleSaveTask = async (taskId: string, updatedTask: any) => {
  //   console.log("Atualizando tarefa:", taskId, updatedTask);  // Log para depuração

  //   const token = localStorage.getItem("token")
  //   const headers = {
  //     "Content-Type": "application/json",
  //     Authorization: `Bearer ${token}`,
  //   }

  //   try {
  //     const response = await fetch(`/api/tarefas/${taskId}`, {
  //       method: "PUT",
  //       headers,
  //       body: JSON.stringify(updatedTask),
  //     })

  //     const data = await response.json()

  //     console.log("Resposta do servidor:", data);  // Log da resposta

  //     if (!response.ok || !data.success) {
  //       throw new Error(data.message || "Erro ao atualizar tarefa.")
  //     }

  //     // Atualize a lista de tarefas localmente após o sucesso
  //     setTaskList(prevList =>
  //       prevList.map((task) =>
  //         task.id === taskId ? { ...task, ...updatedTask } : task
  //       )
  //     )

  //     // Se a atualização for bem-sucedida, retorna para o diálogo
  //     addNotification("Tarefa atualizada", `A tarefa "${updatedTask.title}" foi atualizada.`)
  //     return true
  //   } catch (error) {
  //     console.error("Erro ao atualizar tarefa:", error)
  //     addNotification("Erro ao atualizar tarefa", "Não foi possível atualizar a tarefa. Tente novamente.")
  //     throw error
  //   }
  // }

  const handleDeleteTask = async () => {
    if (!selectedTask) return

    try {
      const token = localStorage.getItem("token")

      const response = await fetch(`/api/tarefas/${selectedTask.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao excluir tarefa.")
      }

      // Atualiza a lista local removendo a tarefa
      const updatedTasks = taskList.filter((task) => task.id !== selectedTask.id)
      setTaskList(updatedTasks)

      addNotification(
        "Tarefa excluída",
        `A tarefa "${selectedTask.title}" para o cliente ${selectedTask.client} foi excluída.`
      )

      setDeleteDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
      addNotification("Erro ao excluir tarefa", "Não foi possível excluir a tarefa. Tente novamente.")
    }
  }


  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead>Comentários</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {taskList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              taskList.map((task) => (
                <TableRow key={task.id}>
                  <TableCell className="font-medium">{task.title}</TableCell>
                  <TableCell>
                    <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                      {task.client}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {(typeof task.assignee === "string"
                            ? task.assignee
                            : task.assignee?.name
                          )
                            ?.split(" ")
                            .map((n: string) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">
                        {typeof task.assignee === "string" ? task.assignee : task.assignee?.name}
                      </span>
                    </div>

                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {task.entity}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <Badge variant={task.isAdministrative ? "default" : "secondary"} className="text-xs">
                      {task.isAdministrative ? "Administrativo" : "Técnico"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(task.createdAt)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center gap-1"
                      onClick={() => handleOpenCommentDialog(task)}
                    >
                      <MessageSquare className="h-4 w-4" />
                      <span>{task.comments.length}</span>
                    </Button>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          Ações
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleOpenCommentDialog(task)}
                        >
                          <MessageSquare className="h-4 w-4" />
                          <span>Ver comentários</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2"
                          onClick={() => handleOpenEditDialog(task)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span>Editar</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="flex items-center gap-2 text-destructive"
                          onClick={() => handleOpenDeleteDialog(task)}
                        >
                          <Trash2 className="h-4 w-4" />
                          <span>Excluir</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de comentários */}
      {selectedTask && (
        <CommentDialog
          open={commentDialogOpen}
          onOpenChange={setCommentDialogOpen}
          taskId={selectedTask.id}
          taskTitle={selectedTask.title}
          client={selectedTask.client}
          comments={selectedTask.comments}
          onAddComment={handleAddComment}
        />
      )}

      {/* Diálogo de edição */}
      {/* {selectedTask && (
        <EditTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={selectedTask}
          onSave={handleSaveTask}
        />
      )} */}

      {/* Diálogo de confirmação de exclusão */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir tarefa"
        description="Tem certeza que deseja excluir esta tarefa? Esta ação não pode ser desfeita."
        onConfirm={handleDeleteTask}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </>
  )
}
