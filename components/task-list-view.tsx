"use client"

import { useState, useEffect } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, MessageSquare, Tag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useNotifications } from "./notification-provider"
import { ConfirmDialog } from "./confirm-dialog"
import { CommentDialog, type Comment } from "./comment-dialog"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskFilters } from "./task-filters"
import { useAuth } from "./auth-provider"

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
  assignee: {
    id: string
    full_name: string
  } | null
  entity: string
  project: string | null
  taskType: "technical" | "administrative"
  comments: Comment[]
  status: string
  completedAt: string | null
  archivedAt: string | null
  tags: TaskTag[]
}

const initialTasks: Task[] = []

export function TaskListView() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filteredTasks, setFilteredTasks] = useState<Task[]>(initialTasks)
  const [filters, setFilters] = useState<any>({})
  const { addNotification } = useNotifications()
  const { user } = useAuth()

  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const [availableProjects, setAvailableProjects] = useState<{ id: string; name: string }[]>([])
  const [availableClients, setAvailableClients] = useState<{ id: string; name: string }[]>([])
  const [availableUsers, setAvailableUsers] = useState<{ id: string; name: string }[]>([])
  const [availableEntities, setAvailableEntities] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token")
        const headers = { Authorization: `Bearer ${token}` }

        const [tasksRes, projectsRes, clientsRes, usersRes, entitiesRes] = await Promise.all([
          fetch("/api/tarefas", { headers }),
          fetch("/api/projetos", { headers }),
          fetch("/api/clientes", { headers }),
          fetch("/api/usuarios", { headers }),
          fetch("/api/entidades", { headers }),
        ])

        const [tasksData, projectsData, clientsData, usersData, entitiesData] = await Promise.all([
          tasksRes.json(),
          projectsRes.json(),
          clientsRes.json(),
          usersRes.json(),
          entitiesRes.json(),
        ])

        if (tasksData.success) {
          setTasks(tasksData.tasks)
          setFilteredTasks(tasksData.tasks)
        }

        if (projectsData.success) setAvailableProjects(projectsData.projetos ?? [])
        if (clientsData.success) setAvailableClients(clientsData.clientes ?? [])
        if (usersData.success) {
          const formattedUsers = usersData.usuarios.map((u: any) => ({
            id: u.id,
            name: `${u.firstName} ${u.lastName}`.trim()
          }))
          setAvailableUsers(formattedUsers)
        }
        if (entitiesData.success) setAvailableEntities(entitiesData.entidades ?? [])

      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true); // Inicia o carregamento

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    try {
      const tasksRes = await fetch("/api/tarefas", { headers });
      const tasksData = await tasksRes.json();

      if (tasksData.success) {
        setTasks(tasksData.tasks);  // Atualiza a lista de tarefas
        setFilteredTasks(tasksData.tasks);  // Atualiza a lista filtrada, caso esteja usando filtros
      } else {
        addNotification("Erro", "Não foi possível carregar as tarefas.");
      }
    } catch (error) {
      console.error("Erro ao carregar tarefas:", error);
      addNotification("Erro", "Erro ao carregar as tarefas.");
    } finally {
      setIsLoading(false);  // Finaliza o carregamento
    }
  };


  useEffect(() => {
    if (!filters || Object.keys(filters).length === 0) {
      setFilteredTasks(tasks)
      return
    }

    const searchTerm = filters.search?.toLowerCase() || ""

    const filtered = tasks.filter((task) => {
      const assigneeName = task.assignee?.full_name?.toLowerCase() ?? ""
      return (
        task.title.toLowerCase().includes(searchTerm) ||
        task.description.toLowerCase().includes(searchTerm) ||
        task.client.toLowerCase().includes(searchTerm) ||
        assigneeName.includes(searchTerm) ||
        task.entity.toLowerCase().includes(searchTerm) ||
        (task.project && task.project.toLowerCase().includes(searchTerm)) ||
        task.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm))
      )
    })

    setFilteredTasks(filtered)
  }, [filters, tasks])

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters)
  }

  const handleOpenCommentDialog = (task: Task) => {
    setSelectedTask(task)
    setCommentDialogOpen(true)
  }

  const handleOpenEditDialog = (task: Task) => {
    setSelectedTask(task)
    setEditDialogOpen(true)
  }

  const handleOpenDeleteDialog = (task: Task) => {
    setSelectedTask(task)
    setDeleteDialogOpen(true)
  }


  const handleSaveTask = async (taskId: string, updatedTask: any) => {
    console.log("Atualizando tarefa:", taskId, updatedTask);  // Log para depuração

    const token = localStorage.getItem("token")
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    }

    try {
      const response = await fetch(`/api/tarefas/${taskId}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(updatedTask),  // Certifique-se de que o ID do cliente está sendo enviado
      })

      const data = await response.json()

      console.log("Resposta do servidor:", data);  // Log da resposta

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao atualizar tarefa.")
      }

      await fetchData(); // Refaz a requisição GET para obter os dados atualizados do servidor

      // Se a atualização for bem-sucedida, retorna para o diálogo
      addNotification("Tarefa atualizada", `A tarefa "${updatedTask.title}" foi atualizada.`)
      return true
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      addNotification("Erro ao atualizar tarefa", "Não foi possível atualizar a tarefa. Tente novamente.")
      throw error
    }
  }


  const handleDeleteTask = async () => {
    if (!selectedTask) return

    try {
      const token = localStorage.getItem("token")
      const response = await fetch(`/api/tarefas/${selectedTask.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao excluir tarefa")
      }

      setTasks((prev) => prev.filter((task) => task.id !== selectedTask.id))
      addNotification("Tarefa excluída", `A tarefa "${selectedTask.title}" foi excluída com sucesso.`)
      setDeleteDialogOpen(false)
      setSelectedTask(null)
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>
      case "in-progress":
        return <Badge variant="secondary">Em andamento</Badge>
      case "completed":
        return <Badge variant="default">Finalizada</Badge>
      default:
        return <Badge variant="outline">Desconhecido</Badge>
    }
  }

  const handleAddComment = async (taskId: string, commentText: string) => {
    if (!user) {
      addNotification("Erro", "Você precisa estar logado para adicionar um comentário.");
      return;
    }

    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    // Criação do comentário localmente
    const newComment: Comment = {
      id: `comment-${Date.now()}`, // Gerando um ID único para o comentário
      text: commentText,
      author: user.name, // Usando o nome do usuário logado
      createdAt: new Date(),
    };

    try {
      // Enviar o comentário para o backend
      const response = await fetch(`/api/tarefas/${taskId}/comentarios`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({ text: commentText, author: user.id }), // Usando o ID do usuário logado
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao adicionar comentário.");
      }


      // Atualizar localmente a lista de tarefas com o novo comentário
      setTasks((prev) =>
        prev.map((task) =>
          task.id === taskId
            ? {
              ...task,
              comments: [newComment, ...task.comments], // Adicionando o novo comentário na lista de comentários da tarefa
            }
            : task
        )
      );

    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      addNotification("Erro ao adicionar comentário", "Não foi possível adicionar o comentário.");
    }
  };


  return (
    <>

      <div className="mb-4 w-full">
        <TaskFilters
          onFilterChange={handleFilterChange}
          availableProjects={availableProjects}
          availableClients={availableClients}
          availableUsers={availableUsers}
          availableEntities={availableEntities}
        />
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
                          {(task.assignee?.full_name ?? "")
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{task.assignee?.full_name}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {task.entity}
                    </Badge>
                  </TableCell>
                  <TableCell>{getStatusBadge(task.status)}</TableCell>
                  <TableCell>
                    <Badge variant={task.taskType === "administrative" ? "default" : "secondary"} className="text-xs">
                      {task.taskType === "administrative" ? "Administrativa" : "Técnica"}
                    </Badge>

                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Array.isArray(task.tags) && task.tags.map((tag) => (
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

      {selectedTask && (
        <EditTaskDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          task={{
            ...selectedTask,
            assignee: selectedTask.assignee?.id ?? "", // ← adapta o tipo
          }}
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
