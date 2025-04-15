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
  assignee: string
  entity: string
  project: string | null
  isAdministrative: boolean
  comments: Comment[]
  status: string
  completedAt: string | null
  archivedAt: string | null
  tags: TagType[]
}

type Column = {
  id: string
  title: string
  tasks: Task[]
}

// Dados de exemplo para os filtros
const clients = [
  { id: "1", name: "Acme Inc" },
  { id: "2", name: "TechCorp" },
  { id: "3", name: "WebSolutions" },
  { id: "4", name: "DataSys" },
]

const users = [
  { id: "1", name: "Erick Silva" },
  { id: "2", name: "Lucas Gomes" },
  { id: "3", name: "Breno Christian" },
  { id: "4", name: "Lucas Santos" },
  { id: "5", name: "André Borges" },
  { id: "6", name: "Aline Borges" },
  { id: "7", name: "Benone França" },
  { id: "8", name: "Luan França" },
  { id: "9", name: "Luanna Barreto" },
]

const entities = [
  { id: "ingline", name: "Ingline Systems" },
  { id: "line_movel", name: "Line Movel" },
  { id: "macrophony", name: "Macrophony" },
  { id: "voicenet", name: "Voicenet" },
  { id: "connyctel", name: "Connyctel" },
]

const projects = [
  { id: "1", name: "Redesenho de Website" },
  { id: "2", name: "Migração de Servidor" },
  { id: "3", name: "Aplicativo Mobile" },
  { id: "4", name: "Integração VoIP" },
]

// Dados de exemplo para tags
const sampleTags = [
  { id: "tag-1", name: "Urgente", color: "#EF4444" },
  { id: "tag-2", name: "Bug", color: "#F97316" },
  { id: "tag-3", name: "Melhoria", color: "#22C55E" },
  { id: "tag-4", name: "Documentação", color: "#3B82F6" },
  { id: "tag-5", name: "Design", color: "#A855F7" },
]

// Dados de exemplo com comentários
const initialData: { columns: Column[] } = {
  columns: [
    {
      id: "pending",
      title: "Pendentes",
      tasks: [],
    },
    {
      id: "in-progress",
      title: "Em andamento",
      tasks: [],
    },
    {
      id: "completed",
      title: "Finalizadas",
      tasks: [],
    },
  ],
}

// Helper function to determine if text should be white or black based on background color
const getContrastColor = (hexColor: string) => {
  // Remove the hash if it exists
  const color = hexColor.charAt(0) === "#" ? hexColor.substring(1, 7) : hexColor
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
    data: {
      type: "task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  // Renderizar tags como badges coloridos com ícone
  const renderTaskTags = (tags: TagType[]) => {
    if (!tags || tags.length === 0) return null

    return (
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag) => {
          const textColor = getContrastColor(tag.color)
          return (
            <span
              key={tag.id}
              className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5"
              style={{
                backgroundColor: tag.color,
                color: textColor,
              }}
            >
              <Tag className="h-3 w-3" />
              {tag.name}
            </span>
          )
        })}
      </div>
    )
  }

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
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onOpenCommentDialog(task)}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Comentários
            </DropdownMenuItem>

            {/* Mostrar opção de arquivar apenas para tarefas concluídas */}
            {task.status === "completed" && (
              <DropdownMenuItem onClick={() => onOpenArchiveDialog(task)}>
                <Archive className="h-4 w-4 mr-2" />
                Arquivar
              </DropdownMenuItem>
            )}

            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive" onClick={() => onOpenDeleteDialog(task)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="flex flex-wrap gap-1 mb-2">
        <span className="text-xs font-medium px-2 py-1 bg-primary/10 text-primary rounded-full">{task.client}</span>
        <Badge variant={task.isAdministrative ? "default" : "secondary"} className="text-xs">
          {task.isAdministrative ? "Administrativo" : "Técnico"}
        </Badge>
      </div>
      {renderTaskTags(task.tags)}
      <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-xs">
              {task.assignee
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs">{task.assignee}</span>
        </div>
        <div className="flex items-center gap-1">
          <Badge variant="outline" className="text-xs">
            {task.entity}
          </Badge>
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
  const [data, setData] = useState(initialData)
  const [filters, setFilters] = useState<any>({})
  const { addNotification } = useNotifications()
  const { user } = useAuth()
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeTask, setActiveTask] = useState<Task | null>(null)

  // Referência para rastrear se o componente está montado
  const isMountedRef = useRef(true)

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

  // Função para aplicar filtros
  const applyFilters = useCallback(
    (task: Task) => {
      // Se não há filtros, retorna true
      if (!filters || Object.keys(filters).length === 0) {
        return true
      }

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

      // Filtrar por cliente
      if (filters.clients && filters.clients.length > 0) {
        const clientNames = filters.clients.map((id: string) => {
          const client = clients.find((c) => c.id === id)
          return client ? client.name : ""
        })
        if (!clientNames.includes(task.client)) return false
      }

      // Filtrar por responsável
      if (filters.users && filters.users.length > 0) {
        const userNames = filters.users.map((id: string) => {
          const user = users.find((u) => u.id === id)
          return user ? user.name : ""
        })
        if (!userNames.includes(task.assignee)) return false
      }

      // Filtrar por entidade
      if (filters.entities && filters.entities.length > 0) {
        const entityNames = filters.entities.map((id: string) => {
          const entity = entities.find((e) => e.id === id)
          return entity ? entity.name : ""
        })
        if (!entityNames.includes(task.entity)) return false
      }

      // Filtrar por tipo de tarefa
      if (filters.taskTypes && filters.taskTypes.length > 0) {
        const isAdministrative = filters.taskTypes.includes("administrative")
        const isTechnical = filters.taskTypes.includes("technical")

        if (isAdministrative && !isTechnical && !task.isAdministrative) return false
        if (!isAdministrative && isTechnical && task.isAdministrative) return false
      }

      // Filtrar por projeto
      if (filters.projects && filters.projects.length > 0) {
        const projectNames = filters.projects.map((id: string) => {
          const project = projects.find((p) => p.id === id)
          return project ? project.name : ""
        })
        if (!task.project || !projectNames.includes(task.project)) return false
      }

      // Filtrar por tags
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = task.tags.some((tag) => filters.tags.includes(tag.id))
        if (!hasMatchingTag) return false
      }

      return true
    },
    [filters],
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

  // Função para adicionar um comentário
  const handleAddComment = useCallback((taskId: string, commentText: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      author: "Usuário Teste", // Em um sistema real, seria o usuário logado
      createdAt: new Date(),
    }

    setData((prevData) => {
      const updatedColumns = prevData.columns.map((column) => {
        const updatedTasks = column.tasks.map((task) => {
          if (task.id === taskId) {
            return {
              ...task,
              comments: [newComment, ...task.comments],
            }
          }
          return task
        })
        return {
          ...column,
          tasks: updatedTasks,
        }
      })
      return { columns: updatedColumns }
    })
  }, [])

  // Função para salvar as alterações de uma tarefa
  const handleSaveTask = useCallback((taskId: string, updatedTask: any) => {
    setData((prevData) => {
      const updatedColumns = prevData.columns.map((column) => {
        // Se a tarefa mudou de status, precisamos movê-la para a coluna correta
        if (updatedTask.status !== column.id) {
          return {
            ...column,
            tasks: column.tasks.filter((task) => task.id !== taskId),
          }
        }

        // Atualizar a tarefa na coluna correta
        if (column.id === updatedTask.status) {
          const taskExists = column.tasks.some((task) => task.id === taskId)

          if (taskExists) {
            return {
              ...column,
              tasks: column.tasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)),
            }
          } else {
            return {
              ...column,
              tasks: [...column.tasks, updatedTask],
            }
          }
        }

        return column
      })
      return { columns: updatedColumns }
    })
  }, [])

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

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event

      if (!over) {
        setActiveId(null)
        setActiveTask(null)
        return
      }

      const activeId = active.id as string
      const overId = over.id as string

      // Encontrar a tarefa ativa
      const { task: activeTask, column: activeColumn } = findTaskById(activeId)

      // Se não encontrou a tarefa ou coluna, retornar
      if (!activeTask || !activeColumn) {
        setActiveId(null)
        setActiveTask(null)
        return
      }

      // Verificar se o overId é uma coluna
      const isOverColumn = data.columns.some((column) => column.id === overId)

      if (isOverColumn) {
        // Mover para outra coluna
        if (activeColumn.id !== overId) {
          setData((prev) => {
            // Remover a tarefa da coluna atual
            const updatedColumns = prev.columns.map((column) => {
              if (column.id === activeColumn.id) {
                return {
                  ...column,
                  tasks: column.tasks.filter((task) => task.id !== activeId),
                }
              }

              if (column.id === overId) {
                // Atualizar o status da tarefa
                const updatedTask = {
                  ...activeTask,
                  status: overId,
                  // Se a tarefa está sendo movida para "completed", definir completedAt
                  completedAt:
                    overId === "completed" && !activeTask.completedAt
                      ? new Date().toISOString()
                      : activeTask.completedAt,
                }

                return {
                  ...column,
                  tasks: [...column.tasks, updatedTask],
                }
              }

              return column
            })

            return { columns: updatedColumns }
          })

          // Notificar sobre a mudança de coluna
          const targetColumn = data.columns.find((col) => col.id === overId)
          if (targetColumn) {
            setTimeout(() => {
              if (!isMountedRef.current) return

              addNotification(
                "Status de tarefa atualizado",
                `A tarefa "${activeTask.title}" para o cliente ${activeTask.client} foi movida para ${targetColumn.title}.`,
              )
            }, 0)
          }
        } else {
          // Tarefa solta na mesma coluna, não fazer nada
        }
      } else {
        // Verificar se o overId é uma tarefa
        const { task: overTask, column: overColumn } = findTaskById(overId)

        if (overTask && overColumn) {
          if (activeColumn.id === overColumn.id) {
            // Reordenar na mesma coluna
            setData((prev) => {
              const column = prev.columns.find((col) => col.id === activeColumn.id)
              if (!column) return prev

              const oldIndex = column.tasks.findIndex((task) => task.id === activeId)
              const newIndex = column.tasks.findIndex((task) => task.id === overId)

              if (oldIndex === -1 || newIndex === -1) return prev

              const updatedTasks = arrayMove(column.tasks, oldIndex, newIndex)

              return {
                columns: prev.columns.map((col) => {
                  if (col.id === column.id) {
                    return { ...col, tasks: updatedTasks }
                  }
                  return col
                }),
              }
            })
          } else {
            // Mover para outra coluna
            setData((prev) => {
              // Remover a tarefa da coluna atual
              const updatedColumns = prev.columns.map((column) => {
                if (column.id === activeColumn.id) {
                  return {
                    ...column,
                    tasks: column.tasks.filter((task) => task.id !== activeId),
                  }
                }

                if (column.id === overColumn.id) {
                  // Atualizar o status da tarefa
                  const updatedTask = {
                    ...activeTask,
                    status: overColumn.id,
                    // Se a tarefa está sendo movida para "completed", definir completedAt
                    completedAt:
                      overColumn.id === "completed" && !activeTask.completedAt
                        ? new Date().toISOString()
                        : activeTask.completedAt,
                  }

                  // Encontrar o índice da tarefa sobre a qual estamos soltando
                  const overIndex = column.tasks.findIndex((task) => task.id === overId)

                  // Inserir a tarefa na posição correta
                  const updatedTasks = [...column.tasks]
                  updatedTasks.splice(overIndex, 0, updatedTask)

                  return {
                    ...column,
                    tasks: updatedTasks,
                  }
                }

                return column
              })

              return { columns: updatedColumns }
            })

            // Notificar sobre a mudança de coluna
            setTimeout(() => {
              if (!isMountedRef.current) return

              addNotification(
                "Status de tarefa atualizado",
                `A tarefa "${activeTask.title}" para o cliente ${activeTask.client} foi movida para ${overColumn.title}.`,
              )
            }, 0)
          }
        }
      }

      setActiveId(null)
      setActiveTask(null)
    },
    [data.columns, findTaskById, addNotification],
  )

  return (
    <>
      <div className="mb-4 w-full">
        <TaskFilters onFilterChange={handleFilterChange} />
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
                <Badge variant={activeTask.isAdministrative ? "default" : "secondary"} className="text-xs">
                  {activeTask.isAdministrative ? "Administrativo" : "Técnico"}
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
