"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, MessageSquare, Pencil, Trash2, Archive, Tag } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// Importar os componentes DnD Kit
import {
  DndContext,
  DragOverlay,
  useDroppable,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"

// Importar os componentes
import { useNotifications } from "./notification-provider"
import { ConfirmDialog } from "./confirm-dialog"
import { CommentDialog, type Comment } from "./comment-dialog"
import { EditTaskDialog } from "./edit-task-dialog"
import { TaskFilters } from "./task-filters"
import { useAuth } from "./auth-provider"

// Tipos para as tarefas e colunas
type TagType = {
  id: string
  name: string
  color: string
}

type Task = {
  id: string
  title: string
  description: string
  client: string
  assignee: { id: string; full_name: string } | string | null  // 👈 atualizado
  entity: string
  project: string | null
  taskType: "administrative" | "technical"
  comments: Comment[]
  status: "pending" | "in-progress" | "completed"
  completedAt: string | null
  archivedAt: string | null
  tags: TagType[]
}

type Column = {
  id: string
  title: string
  tasks: Task[]
}


// Helper function to determine if text should be white or black based on background color
const getContrastColor = (hexColor: string) => {
  // Remove the hash if it exists
  const color = hexColor.charAt(0) === "#" ? hexColor.substring(1, 7) : hexColor
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  // Convert to RGB
  const r = Number.parseInt(color.substring(0, 2), 16)
  const g = Number.parseInt(color.substring(2, 4), 16)
  const b = Number.parseInt(color.substring(4, 6), 16)
  // Calculate luminance - using the relative luminance formula
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255
  // Return black for bright colors and white for dark colors
  return luminance > 0.5 ? "#000000" : "#ffffff"
}

// Componente de tarefa arrastável
function SortableTaskCard({
  task,
  onOpenCommentDialog,
  onOpenEditDialog,
  onOpenDeleteDialog,
  onOpenArchiveDialog,
}: {
  task: Task
  onOpenCommentDialog: (task: Task) => void
  onOpenEditDialog: (task: Task) => void
  onOpenDeleteDialog: (task: Task) => void
  onOpenArchiveDialog: (task: Task) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  const renderTaskTags = (tags: TagType[]) => {
    return tags?.length ? (
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => (
          <span
            key={tag.id}
            className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5"
            style={{
              backgroundColor: tag.color,
              color: getContrastColor(tag.color),
            }}
          >
            <Tag className="h-3 w-3" />
            {tag.name}
          </span>
        ))}
      </div>
    ) : null
  }

  const assigneeName =
    typeof task.assignee === "string"
      ? task.assignee
      : task.assignee?.full_name || "Sem responsável"

  const assigneeInitials = assigneeName
    .split(" ")
    .map((n) => n[0])
    .join("")

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="task-card relative bg-card border rounded-md p-3 shadow-sm cursor-move"
      data-task-id={task.id}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm">{task.title}</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => onOpenEditDialog(task)}>
              <Pencil className="h-4 w-4 mr-2" /> Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenCommentDialog(task)}>
              <MessageSquare className="h-4 w-4 mr-2" /> Comentários
            </DropdownMenuItem>
            {task.status === "completed" && (
              <DropdownMenuItem onClick={() => onOpenArchiveDialog(task)}>
                <Archive className="h-4 w-4 mr-2" /> Arquivar
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onOpenDeleteDialog(task)}>
              <Trash2 className="h-4 w-4 mr-2" /> Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-wrap gap-1 mb-2">
        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
          {task.client}
        </span>
        <Badge variant={task.taskType === "administrative" ? "default" : "secondary"} className="text-xs">
          {task.taskType === "administrative" ? "Administrativo" : "Técnico"}
        </Badge>
      </div>

      {renderTaskTags(task.tags)}
      <p className="text-xs text-muted-foreground mb-3">{task.description}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">{assigneeInitials}</AvatarFallback>
          </Avatar>
          <span className="text-sm">{assigneeName}</span>
        </div>

        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">{task.entity}</Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs flex items-center gap-1"
            onClick={() => onOpenCommentDialog(task)}
          >
            <MessageSquare className="h-3 w-3" />
            <span>{task.comments.length}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

// Componente de coluna com área de soltar
function DroppableColumn({
  column,
  tasks,
  onOpenCommentDialog,
  onOpenEditDialog,
  onOpenDeleteDialog,
  onOpenArchiveDialog,
}: {
  column: Column
  tasks: Task[]
  onOpenCommentDialog: (task: Task) => void
  onOpenEditDialog: (task: Task) => void
  onOpenDeleteDialog: (task: Task) => void
  onOpenArchiveDialog: (task: Task) => void
}) {
  // Usar o hook useDroppable para tornar a coluna uma área de soltar
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  return (
    <div className="flex flex-col w-full">
      <Card className="h-full w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            {column.title}
            <Badge variant="outline">{tasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div
            ref={setNodeRef}
            className={`kanban-column space-y-3 min-h-[200px] p-2 rounded-md ${isOver ? "bg-accent/50" : ""}`}
            style={{ minHeight: "200px" }}
          >
            <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onOpenCommentDialog={onOpenCommentDialog}
                  onOpenEditDialog={onOpenEditDialog}
                  onOpenDeleteDialog={onOpenDeleteDialog}
                  onOpenArchiveDialog={onOpenArchiveDialog}
                />
              ))}
            </SortableContext>
            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">Nenhuma tarefa encontrada nesta coluna</div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function KanbanBoard() {
  const [data, setData] = useState<{ columns: Column[] }>({
    columns: [
      { id: "pending", title: "Pendentes", tasks: [] },
      { id: "in-progress", title: "Em andamento", tasks: [] },
      { id: "completed", title: "Finalizadas", tasks: [] },
    ],
  })

  const [filters, setFilters] = useState<any>({})
  const [projects, setProjects] = useState<{ id: string; name: string }[]>([])
  const [clients, setClients] = useState<{ id: string; name: string }[]>([])
  const [users, setUsers] = useState<{ id: string; name: string }[]>([])
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([])

  const { addNotification } = useNotifications()
  const { user } = useAuth()

  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  const isMountedRef = useRef(true)

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
          const pending: Task[] = []
          const inProgress: Task[] = []
          const completed: Task[] = []

          for (const task of tasksData.tasks) {
            if (task.status === "pending") pending.push(task)
            else if (task.status === "in-progress") inProgress.push(task)
            else if (task.status === "completed") completed.push(task)
          }

          setData({
            columns: [
              { id: "pending", title: "Pendentes", tasks: pending },
              { id: "in-progress", title: "Em andamento", tasks: inProgress },
              { id: "completed", title: "Finalizadas", tasks: completed },
            ],
          })
        }

        if (projectsData.success) setProjects(projectsData.projetos || [])
        if (clientsData.success) setClients(clientsData.clientes || [])
        if (usersData.success) setUsers(usersData.usuarios || [])
        if (entitiesData.success) setEntities(entitiesData.entidades || [])

      } catch (error) {
        console.error("Erro ao carregar dados:", error)
      }
    }

    fetchData()
  }, [])



  // Limpar referências quando o componente for desmontado
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // Configurar sensores para o DnD com configurações mais robustas
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Distância mínima para iniciar o arrasto
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  const applyFilters = useCallback(
    (task: Task) => {
      if (!filters || Object.keys(filters).length === 0) {
        return true
      }

      const assigneeName =
        typeof task.assignee === "string"
          ? task.assignee
          : task.assignee?.full_name || ""

      const assigneeId =
        typeof task.assignee === "object" && task.assignee?.id
          ? task.assignee.id
          : typeof task.assignee === "string"
            ? task.assignee
            : ""

      const projectName = typeof task.project === "string" ? task.project : ""

      // 🔍 Filtro por busca textual
      if (filters.search && filters.search.trim() !== "") {
        const searchTerm = filters.search.toLowerCase()
        const matchesSearch =
          task.title.toLowerCase().includes(searchTerm) ||
          task.description.toLowerCase().includes(searchTerm) ||
          task.client.toLowerCase().includes(searchTerm) ||
          assigneeName.toLowerCase().includes(searchTerm) ||
          task.entity.toLowerCase().includes(searchTerm) ||
          projectName.toLowerCase().includes(searchTerm) ||
          task.tags.some((tag) => tag.name.toLowerCase().includes(searchTerm))

        if (!matchesSearch) return false
      }

      // 👥 Filtro por clientes
      if (filters.clients?.length) {
        const clientNames = filters.clients.map((id: string) => {
          const client = clients.find((c) => c.id === id)
          return client?.name || ""
        })
        if (!clientNames.includes(task.client)) return false
      }

      // 👤 Filtro por responsáveis
      if (filters.users?.length) {
        if (!filters.users.includes(assigneeId)) return false
      }

      // 🏢 Filtro por entidades
      if (filters.entities?.length) {
        const entityNames = filters.entities.map((id: string) => {
          const entity = entities.find((e) => e.id === id)
          return entity?.name || ""
        })
        if (!entityNames.includes(task.entity)) return false
      }

      // 🔧 Filtro por tipo de tarefa
      if (filters.taskTypes?.length) {
        const isAdministrative = filters.taskTypes.includes("administrative")
        const isTechnical = filters.taskTypes.includes("technical")

        if (isAdministrative && !isTechnical && task.taskType !== "administrative") return false
        if (!isAdministrative && isTechnical && task.taskType !== "technical") return false
      }

      // 📁 Filtro por projeto
      if (filters.projects?.length) {
        const projectNames = filters.projects.map((id: string) => {
          const project = projects.find((p) => p.id === id)
          return project?.name || ""
        })
        if (!projectName || !projectNames.includes(projectName)) return false
      }

      // 🏷️ Filtro por tags
      if (filters.tags?.length) {
        const hasMatchingTag = task.tags.some((tag) => filters.tags.includes(tag.id))
        if (!hasMatchingTag) return false
      }

      return true
    },
    [filters, clients, users, entities, projects]
  )

  // Filtrar dados com base nos filtros
  const filteredData = useMemo(() => {
    return {
      columns: data.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter(applyFilters),
      })),
    }
  }, [data, applyFilters])

  // Verificar tarefas que precisam ser arquivadas automaticamente (48 horas após conclusão)
  useEffect(() => {
    const checkTasksForAutoArchive = () => {
      if (!isMountedRef.current) return

      const now = new Date()
      const tasksToArchive: { id: string; title: string }[] = []

      setData((prevData) => {
        const updatedColumns = prevData.columns.map((column) => {
          if (column.id !== "completed") return column

          const updatedTasks = column.tasks.filter((task) => {
            if (!task.completedAt || task.archivedAt) return true

            const completedDate = new Date(task.completedAt)
            const hoursSinceCompletion = (now.getTime() - completedDate.getTime()) / (1000 * 60 * 60)

            if (hoursSinceCompletion >= 48) {
              // Adicionar à lista de tarefas para arquivar
              tasksToArchive.push({ id: task.id, title: task.title })
              return false
            }

            return true
          })

          return {
            ...column,
            tasks: updatedTasks,
          }
        })

        return { columns: updatedColumns }
      })

      // Enviar notificações após a atualização do estado
      if (tasksToArchive.length > 0 && isMountedRef.current) {
        // Usar um timeout para garantir que as notificações sejam enviadas após a renderização
        const timer = setTimeout(() => {
          if (!isMountedRef.current) return

          tasksToArchive.forEach((task) => {
            addNotification(
              "Tarefa arquivada automaticamente",
              `A tarefa "${task.title}" foi arquivada automaticamente após 48 horas de conclusão.`,
            )
          })
        }, 0)

        return () => clearTimeout(timer)
      }
    }

    // Verificar ao carregar e a cada hora
    checkTasksForAutoArchive()
    const interval = setInterval(checkTasksForAutoArchive, 60 * 60 * 1000)

    return () => clearInterval(interval)
  }, [addNotification])

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])

  // Função para abrir o diálogo de comentários
  const handleOpenCommentDialog = useCallback((task: Task) => {
    setSelectedTask(task)
    setCommentDialogOpen(true)
  }, [])

  // Função para abrir o diálogo de edição
  const handleOpenEditDialog = useCallback((task: Task) => {
    setSelectedTask(task)
    setEditDialogOpen(true)
  }, [])

  // Função para abrir o diálogo de confirmação de exclusão
  const handleOpenDeleteDialog = useCallback((task: Task) => {
    setSelectedTask(task)
    setDeleteDialogOpen(true)
  }, [])

  // Função para abrir o diálogo de confirmação de arquivamento
  const handleOpenArchiveDialog = useCallback((task: Task) => {
    setSelectedTask(task)
    setArchiveDialogOpen(true)
  }, [])


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
        body: JSON.stringify({ text: commentText, author: user.name }), // Usando o ID do usuário logado
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao adicionar comentário.");
      }

      // Atualizar localmente a lista de tarefas com o novo comentário
      setData((prevData) => {
        const updatedColumns = prevData.columns.map((column) => {
          const updatedTasks = column.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                comments: [newComment, ...task.comments], // Adicionando o novo comentário na lista de comentários da tarefa
              };
            }
            return task;
          });
          return { ...column, tasks: updatedTasks };
        });
        return { columns: updatedColumns };
      });

      // Atualizar a lista de comentários no componente pai (passando para o Dialog)
      setSelectedTask((prevTask) => {
        if (prevTask && prevTask.id === taskId) {
          return {
            ...prevTask,
            comments: [newComment, ...prevTask.comments],
          };
        }
        return prevTask;
      });

    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      addNotification("Erro ao adicionar comentário", "Não foi possível adicionar o comentário.");
    }
  };

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


      // Se a atualização for bem-sucedida, retorna para o diálogo
      addNotification("Tarefa atualizada", `A tarefa "${updatedTask.title}" foi atualizada.`)
      return true
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      addNotification("Erro ao atualizar tarefa", "Não foi possível atualizar a tarefa. Tente novamente.")
      throw error
    }
  }


  // Função para excluir uma tarefa
  const handleDeleteTask = useCallback(() => {
    if (!selectedTask) return

    setData((prevData) => ({
      columns: prevData.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== selectedTask.id),
      })),
    }))

    // Usar um timeout para garantir que a notificação seja enviada após a renderização
    setTimeout(() => {
      if (!isMountedRef.current) return

      addNotification(
        "Tarefa excluída",
        `A tarefa "${selectedTask.title}" para o cliente ${selectedTask.client} foi excluída.`,
      )
    }, 0)

    setDeleteDialogOpen(false)
  }, [selectedTask, addNotification])

  // Função para arquivar uma tarefa
  const handleArchiveTask = useCallback(() => {
    if (!selectedTask) return

    // Remover a tarefa da coluna "completed"
    setData((prevData) => ({
      columns: prevData.columns.map((column) => ({
        ...column,
        tasks: column.tasks.filter((task) => task.id !== selectedTask.id),
      })),
    }))

    // Usar um timeout para garantir que a notificação seja enviada após a renderização
    setTimeout(() => {
      if (!isMountedRef.current) return

      addNotification(
        "Tarefa arquivada",
        `A tarefa "${selectedTask.title}" para o cliente ${selectedTask.client} foi arquivada.`,
      )
    }, 0)

    setArchiveDialogOpen(false)
  }, [selectedTask, addNotification])

  // Encontrar a tarefa pelo ID
  const findTaskById = useCallback(
    (id: string) => {
      for (const column of data.columns) {
        const task = column.tasks.find((task) => task.id === id)
        if (task) {
          return { task, column }
        }
      }
      return { task: null, column: null }
    },
    [data.columns],
  )

  // Eventos de drag and drop
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    const { task } = active.data.current || {}

    setActiveId(active.id as string)
    setActiveTask(task || null)
  }, [])

  const handleDragOver = useCallback((event: DragOverEvent) => {
    // Não precisamos implementar nada aqui, pois estamos usando o useDroppable
    // para lidar com a detecção de coluna
  }, [])

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      setActiveTask(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const { task: activeTask, column: activeColumn } = findTaskById(activeId)
    if (!activeTask || !activeColumn) {
      setActiveId(null)
      setActiveTask(null)
      return
    }

    const isOverColumn = data.columns.some((col) => col.id === overId)

    if (isOverColumn) {
      if (activeColumn.id !== overId) {
        const updatedTask: Task = {
          ...activeTask,
          status: overId as Task["status"],
          completedAt: overId === "completed" && !activeTask.completedAt ? new Date().toISOString() : activeTask.completedAt,
        }

        setData((prev) => {
          const updatedColumns = prev.columns.map((column) => {
            if (column.id === activeColumn.id) {
              return {
                ...column,
                tasks: column.tasks.filter((task) => task.id !== activeId),
              }
            }
            if (column.id === overId) {
              return {
                ...column,
                tasks: [...column.tasks, updatedTask],
              }
            }
            return column
          })

          return { columns: updatedColumns }
        })

        try {
          const token = localStorage.getItem("token")
          await fetch(`/api/tarefas/${activeTask.id}`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              status: overId,
              completedAt: updatedTask.completedAt,
            }),
          })
        } catch (err) {
          console.error("Erro ao atualizar status da tarefa:", err)
        }

        const targetColumn = data.columns.find((col) => col.id === overId)
        if (targetColumn) {
          setTimeout(() => {
            if (!isMountedRef.current) return
            addNotification("Status de tarefa atualizado", `A tarefa "${activeTask.title}" foi movida para ${targetColumn.title}.`)
          }, 0)
        }
      }
    } else {
      const { task: overTask, column: overColumn } = findTaskById(overId)

      if (overTask && overColumn) {
        if (activeColumn.id === overColumn.id) {
          // Reordenar dentro da mesma coluna
          setData((prev) => {
            const updatedColumns = prev.columns.map((col) => {
              if (col.id !== activeColumn.id) return col

              const oldIndex = col.tasks.findIndex((task) => task.id === activeId)
              const newIndex = col.tasks.findIndex((task) => task.id === overId)
              if (oldIndex === -1 || newIndex === -1) return col

              const reordered = arrayMove(col.tasks, oldIndex, newIndex)
              return { ...col, tasks: reordered }
            })

            return { columns: updatedColumns }
          })
        } else {
          // Mover entre colunas e inserir em posição específica
          const updatedTask: Task = {
            ...activeTask,
            status: overColumn.id as Task["status"],
            completedAt: overColumn.id === "completed" && !activeTask.completedAt
              ? new Date().toISOString()
              : activeTask.completedAt,
          }

          setData((prev) => {
            const updatedColumns = prev.columns.map((col) => {
              if (col.id === activeColumn.id) {
                return {
                  ...col,
                  tasks: col.tasks.filter((task) => task.id !== activeId),
                }
              }

              if (col.id === overColumn.id) {
                const insertAt = col.tasks.findIndex((task) => task.id === overId)
                const updatedTasks = [...col.tasks]
                updatedTasks.splice(insertAt, 0, updatedTask)
                return {
                  ...col,
                  tasks: updatedTasks,
                }
              }

              return col
            })

            return { columns: updatedColumns }
          })

          setTimeout(() => {
            if (!isMountedRef.current) return
            addNotification(
              "Status de tarefa atualizado",
              `A tarefa "${activeTask.title}" para o cliente ${activeTask.client} foi movida para ${overColumn.title}.`
            )
          }, 0)
        }
      }
    }

    setActiveId(null)
    setActiveTask(null)
  }, [data.columns, findTaskById, addNotification])


  return (
    <>
      <div className="mb-4 w-full">
        <TaskFilters
          onFilterChange={handleFilterChange}
          availableProjects={projects}
          availableClients={clients}
          availableUsers={users}
          availableEntities={entities}
        />

      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-full">
          {filteredData.columns.map((column) => (
            <DroppableColumn
              key={column.id}
              column={column}
              tasks={column.tasks}
              onOpenCommentDialog={handleOpenCommentDialog}
              onOpenEditDialog={handleOpenEditDialog}
              onOpenDeleteDialog={handleOpenDeleteDialog}
              onOpenArchiveDialog={handleOpenArchiveDialog}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="task-card relative bg-card border rounded-md p-3 shadow-lg cursor-move w-80">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium text-sm">{activeTask.title}</h3>
              </div>
              <div className="flex flex-wrap gap-1 mb-2">
                <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">
                  {activeTask.client}
                </span>
                <Badge variant={activeTask.taskType === "administrative" ? "default" : "secondary"} className="text-xs">
                  {activeTask.taskType === "administrative" ? "Administrativo" : "Técnico"}
                </Badge>

              </div>
              <p className="text-xs text-muted-foreground mb-3">{activeTask.description}</p>
            </div>
          ) : null}
        </DragOverlay>

      </DndContext>

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
          task={{
            ...selectedTask,
            assignee:
              typeof selectedTask.assignee === "string"
                ? selectedTask.assignee
                : selectedTask.assignee?.id || "", // ou full_name, dependendo do componente
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

      {/* Diálogo de confirmação de arquivamento */}
      <ConfirmDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        title="Arquivar tarefa"
        description="Tem certeza que deseja arquivar esta tarefa? Ela será movida para a seção de tarefas arquivadas e não poderá mais ser editada."
        onConfirm={handleArchiveTask}
        confirmText="Sim, arquivar"
        cancelText="Cancelar"
      />
    </>
  )
}
