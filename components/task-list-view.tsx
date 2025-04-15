"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MessageSquare, Tag } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNotifications } from "./notification-provider"
import { ConfirmDialog } from "./confirm-dialog"
import { CommentDialog, type Comment } from "./comment-dialog"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskFilters } from "./task-filters"
import { useAuth } from "./auth-provider"

// Tipos
type TaskTag = {
  id: string
  name: string
  color: string
}

type Task = {
  id: string
  title: string
  description: string
  client: string
  assignee: string
  entity: string
  project: string | null
  isAdministrative: boolean
  comments: Comment[]
  status: string
  completedAt: string | null
  archivedAt: string | null
  tags: TaskTag[]
}

// Dados de exemplo para tags
const sampleTags = [
  { id: "tag-1", name: "Urgente", color: "#EF4444" },
  { id: "tag-2", name: "Bug", color: "#F97316" },
  { id: "tag-3", name: "Melhoria", color: "#22C55E" },
  { id: "tag-4", name: "Documentação", color: "#3B82F6" },
  { id: "tag-5", name: "Design", color: "#A855F7" },
]

// Dados de exemplo com comentários
const initialTasks: Task[] = []

export function TaskListView() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks)
  const [filters, setFilters] = useState<any>({})
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  // Estados para os diálogos
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)

  // Aplicar filtros quando eles mudarem
  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) {
      setFilteredTasks(tasks)
      return
    }

    const filtered = tasks.filter((task) => {
      // Filtrar por texto de busca
      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm) ||
          task.client.toLowerCase().includes(searchTerm) ||
          task.assignee.toLowerCase().includes(searchTerm) ||
          task.entity.toLowerCase().includes(searchTerm) ||
          (task.project && task.project.toLowerCase().includes(searchTerm)) ||
          task.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm))

        if (!matchesSearch) return false
      }

      // Outros filtros podem ser adicionados aqui

      return true
    })

    setFilteredTasks(filtered)
  }, [filters, tasks])

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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  // Verificar se o usuário tem permissão para atualizar o status da tarefa
  const canUpdateTaskStatus = (task: Task) => {
    // Em um sistema real, verificaria as permissões do usuário
    // Por enquanto, apenas o responsável pela tarefa pode atualizar o status
    return user?.name === task.assignee
  }

  // Função para abrir o diálogo de comentários
  const handleOpenCommentDialog = (task: Task) => {
    setSelectedTask(task)
    setCommentDialogOpen(true)
  }

  // Função para abrir o diálogo de edição
  const handleOpenEditDialog = (task: Task) => {
    setSelectedTask(task)
    setEditDialogOpen(true)
  }

  // Função para abrir o diálogo de confirmação de exclusão
  const handleOpenDeleteDialog = (task: Task) => {
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

    setTasks((prevTasks) =>
      prevTasks.map((task) => (task.id === taskId ? { ...task, comments: [newComment, ...task.comments] } : task)),
    )
  }

  // Função para salvar as alterações de uma tarefa
  const handleSaveTask = (taskId: string, updatedTask: any) => {
    setTasks((prevTasks) => prevTasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)))
  }

  // Função para excluir uma tarefa
  const handleDeleteTask = () => {
    if (!selectedTask) return

    setTasks((prevTasks) => prevTasks.filter((task) => task.id !== selectedTask.id))

    addNotification(
      "Tarefa excluída",
      `A tarefa "${selectedTask.title}" para o cliente ${selectedTask.client} foi excluída.`,
    )

    setDeleteDialogOpen(false)
  }

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  return (
    <>
      <div className="mb-4 w-full">
        <TaskFilters onFilterChange={handleFilterChange} />
      </div>

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
              <TableHead>Tags</TableHead>
              <TableHead>Comentários</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhuma tarefa encontrada.
                </TableCell>
              </TableRow>
            ) : (
              filteredTasks.map((task) => (
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
                          {task.assignee
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {task.assignee}
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
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {task.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5"
                          style={{
                            backgroundColor: tag.color,
                            color: "white",
                          }}
                        >
                          <Tag className="h-3 w-3" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
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
      {selectedTask && (
        <EditTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={selectedTask}
          onSave={handleSaveTask}
        />
      )}

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
