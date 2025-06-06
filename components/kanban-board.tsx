"use client"
import { useState, useEffect, useCallback, useMemo, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, MessageSquare, Pencil, Trash2, Archive, Tag, Paperclip } from "lucide-react"
import { AttachmentDialog } from "@/components/attachmentdialog"
import { AttachmentViewDialog } from "@/components/attachment-view-dialog"




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

export type Task = {
  id: string;
  title: string;
  description: string;
  client: string;
  assignee: { id: string; full_name: string } | string | null;
  entity_name: string;
  entity: string;
  project: string | null;
  taskType: "administrative" | "technical";
  comments: Comment[];
  status: "pending" | "in-progress" | "completed" | "archived";
  completedAt: string | null;
  archivedAt: string | null;
  tags: TagType[];
  attachments?: { id: string; name: string; url: string }[]; // Novo campo
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


function SortableTaskCard({
  task,
  onOpenCommentDialog,
  onOpenEditDialog,
  onOpenDeleteDialog,
  onOpenArchiveDialog,
  onUploadAttachment,
  onViewAttachments,
}: {
  task: Task
  onOpenCommentDialog: (task: Task) => void
  onOpenEditDialog: (task: Task) => void
  onOpenDeleteDialog: (task: Task) => void
  onOpenArchiveDialog: (task: Task) => void
  onUploadAttachment: (task: Task) => void
  onViewAttachments: (task: Task) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { type: "task", task },
  })

  const { setNodeRef: droppableRef, isOver: isTaskOver } = useDroppable({
    id: task.id,
    data: { type: "task", task },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
  }

  // Função para renderizar os anexos
  const renderAttachments = (attachments: any) => {
    if (!attachments || attachments.length === 0) {
      return <div>Nenhum anexo encontrado.</div>;
    }


    return (
      <div className="attachments">
        {attachments.map((attachment: any) => (
          <div key={attachment.id} className="attachment-item">
            <a href={attachment.url} target="_blank" rel="noopener noreferrer">
              <Paperclip className="h-4 w-4 mr-2" /> {attachment.name}
            </a>
            {/* Adiciona um botão para baixar o arquivo */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(attachment.url, "_blank")}
            >
              Baixar
            </Button>
          </div>
        ))}
      </div>
    );
  };



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
            <DropdownMenuItem onClick={() => onUploadAttachment(task)}>
              <Paperclip className="h-4 w-4 mr-2" /> Anexo
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
          <Badge variant="outline" className="text-xs">{task.entity_name}</Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs flex items-center gap-1"
            onClick={() => onOpenCommentDialog(task)}
          >
            <MessageSquare className="h-3 w-3" />
            <span>{task.comments.length}</span>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs flex items-center gap-1"
            onClick={() => onViewAttachments(task)}
          >
            <Paperclip className="h-4 w-4 mr-2" /> Visualizar Anexos
          </Button>
        </div>
      </div>
    </div>
  )
}

function DroppableColumn({
  column,
  tasks,
  onOpenCommentDialog,
  onOpenEditDialog,
  onOpenDeleteDialog,
  onOpenArchiveDialog,
  onUploadAttachment,
  onViewAttachments,
}: {
  column: Column
  tasks: Task[]
  onOpenCommentDialog: (task: Task) => void
  onOpenEditDialog: (task: Task) => void
  onOpenDeleteDialog: (task: Task) => void
  onOpenArchiveDialog: (task: Task) => void
  onUploadAttachment: (task: Task) => void
  onViewAttachments: (task: Task) => void
}) {
  // Usar o useDroppable para definir a área de drop
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "column", column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col w-full bg-transparent`}
      style={{
        minHeight: "300px", // Garante que a área de drop tenha altura mínima
        flexGrow: 1,        // Faz com que a coluna ocupe o máximo possível de espaço
        cursor: isOver ? "copy" : "move", // Alterar o cursor para indicar que pode soltar
        padding: "1rem",    // Adiciona padding ao redor da área
        transition: "background-color 0.3s ease, border 0.3s ease", // Transição suave de fundo e borda
        borderRadius: "0.5rem", // Bordas arredondadas
        backgroundColor: isOver ? "#b0d0ff" : "transparent", // Azul suave
      }}
    >
      <Card className="h-full w-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center justify-between">
            {column.title}
            <Badge variant="outline">{tasks.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1">
          <div className="kanban-column space-y-3">
            <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
              {tasks.map((task) => (
                <SortableTaskCard
                  key={task.id}
                  task={task}
                  onOpenCommentDialog={onOpenCommentDialog}
                  onOpenEditDialog={onOpenEditDialog}
                  onOpenDeleteDialog={onOpenDeleteDialog}
                  onOpenArchiveDialog={onOpenArchiveDialog}
                  onUploadAttachment={onUploadAttachment}
                  onViewAttachments={onViewAttachments}
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
  );
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
  const [users, setUsers] = useState<{ id: string; full_name: string }[]>([])
  const [entities, setEntities] = useState<{ id: string; name: string }[]>([])
  const [attachmentDialogOpen, setAttachmentDialogOpen] = useState(false)
  const [attachmentViewDialogOpen, setAttachmentViewDialogOpen] = useState(false);
  const [taskToViewAttachments, setTaskToViewAttachments] = useState<Task | null>(null);
  const [taskToAttach, setTaskToAttach] = useState<Task | null>(null)
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
      const token = localStorage.getItem("token")  // Recupera o token do localStorage
      const headers = { Authorization: `Bearer ${token}` }

      try {
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
        if (usersData.success) {
          const updateUsers = usersData.usuarios.map((u: any) => ({
            id: u.id,
            full_name: `${u.firstName} ${u.lastName}`.trim(),
          }))
          setUsers(updateUsers || []);
        }
        if (entitiesData.success) setEntities(entitiesData.entidades || [])

      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        addNotification("Erro", "Não foi possível carregar os dados.")
      }
    }

    fetchData() // Monta o componente e busca os dados
    const updateTarefas = setInterval(fetchData, 300000) // Atualiza os dados a cada hora

    return () => clearInterval(updateTarefas) // Limpa o intervalo quando o componente for desmontado

  }, [addNotification])



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

  // Função para aplicar filtros nas tarefas
  const applyFilters = useCallback((columns: Column[]) => {
    return columns.map((column) => ({
      ...column,
      tasks: column.tasks.filter((task) => {
        // 🔍 Filtro de busca (por título e descrição)
        if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase()) && !task.description.toLowerCase().includes(filters.search.toLowerCase())) {
          return false;
        }

        // 👥 Filtro por clientes
        if (filters.clients.length > 0 && !filters.clients.includes(task.client)) {
          return false;
        }

        // 👤 Filtro por responsáveis
        if (filters.users.length > 0) {
          const assigneeId = typeof task.assignee === "object" && task.assignee ? task.assignee.id : task.assignee;
          if (!filters.users.includes(assigneeId)) return false;
        }

        // 🏢 Filtro por entidades
        if (filters.entities.length > 0 && !filters.entities.includes(task.entity)) {
          return false;
        }

        // 🔧 Filtro por tipo de tarefa
        if (filters.taskTypes.length > 0 && !filters.taskTypes.includes(task.taskType)) {
          return false;
        }

        // 📁 Filtro por projeto
        if (filters.projects.length > 0 && !filters.projects.includes(task.project)) {
          return false;
        }

        return true;
      }),
    }));
  }, [filters]);

  // UseMemo para otimizar a filtragem das tarefas com base nos filtros
  const filteredData = useMemo(() => {
    return {
      columns: applyFilters(data.columns), // Aplicando filtros nas colunas
    };
  }, [data.columns, applyFilters]);


  const handleArchiveTask = useCallback(async (task: Task) => {
    if (!task) return;
  
    const updatedTask: Task = {
      ...task,
      status: "archived",
      archivedAt: new Date().toISOString(), // Registrando o momento do arquivamento
    };
  
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("Token não encontrado");
  
      const response = await fetch(`/api/tarefas/${updatedTask.id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedTask), // Envia a tarefa com status "archived"
      });
  
      const dataResponse = await response.json();
  
      if (!response.ok || !dataResponse.success) {
        throw new Error(dataResponse.message || "Erro ao arquivar tarefa.");
      }
  
      addNotification("Tarefa arquivada", `A tarefa "${updatedTask.title}" foi arquivada com sucesso.`);
    } catch (error) {
      console.error("Erro ao arquivar tarefa:", error);
      addNotification("Erro ao arquivar tarefa", "Não foi possível arquivar a tarefa.");
    }
  }, [addNotification]);
  

  // const archiveTasksAuto = useCallback(() => {
  //   if (!isMountedRef.current) return;

  //   const now = new Date();
  //   const tasksToArchive: { id: string; title: string }[] = [];

  //   setData((prevData) => {
  //     const updatedColumns = prevData.columns.map((column) => {
  //       if (column.id !== "completed") return column; // Só verificamos tarefas completadas

  //       const updatedTasks = column.tasks.filter((task) => {
  //         if (!task.completedAt || task.archivedAt) return true; // Se não estiver concluída ou já foi arquivada, mantém a tarefa

  //         const completedDate = new Date(task.completedAt);
  //         const secondsSinceCompletion = (now.getTime() - completedDate.getTime()) / 1000; // Tempo em segundos

  //         if (secondsSinceCompletion >= 10) {
  //           tasksToArchive.push({ id: task.id, title: task.title });

  //           // Arquivar a tarefa
  //           const updatedTask: Task = {
  //             ...task,
  //             status: "archived",
  //             archivedAt: now.toISOString(), // Atualiza a data de arquivamento
  //           };

  //           // Atualizando o estado local com a tarefa arquivada
  //           setData((prevData) => {
  //             const updatedColumns = prevData.columns.map((col) => {
  //               if (col.id === column.id) {
  //                 return {
  //                   ...col,
  //                   tasks: col.tasks.map((t) =>
  //                     t.id === task.id ? updatedTask : t
  //                   ),
  //                 };
  //               }
  //               return col;
  //             });

  //             return { columns: updatedColumns };
  //           });

  //           // Retorna false para remover a tarefa da lista de "completadas"
  //           return false;
  //         }

  //         return true;
  //       });

  //       return {
  //         ...column,
  //         tasks: updatedTasks, // Atualiza a coluna com as tarefas filtradas
  //       };
  //     });

  //     return { columns: updatedColumns };
  //   });

  //   // Enviar notificações após a atualização do estado local
  //   if (tasksToArchive.length > 0 && isMountedRef.current) {
  //     const timer = setTimeout(() => {
  //       if (!isMountedRef.current) return;

  //       tasksToArchive.forEach((task) => {
  //         addNotification(
  //           "Tarefa arquivada automaticamente",
  //           `A tarefa "${task.title}" foi arquivada automaticamente após 10 segundos de conclusão.`
  //         );
  //       });
  //     }, 0);

  //     return () => clearTimeout(timer);
  //   }
  // }, [addNotification]);


  // useEffect(() => {
  //   // Chama a função de arquivamento a cada 10 segundos (apenas para fins de teste)
  //   const intervalId = setInterval(() => {
  //     archiveTasksAuto();
  //   }, 10000); // 10000 ms = 10 segundos
  
  //   return () => clearInterval(intervalId); // Limpa o intervalo ao desmontar o componente
  // }, [archiveTasksAuto]); // A função archiveTasksAuto é chamada a cada 10 segundos
  

  // Função para lidar com mudanças nos filtros
  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters)
  }, [])


  const handleUploadAttachment = async (file: File) => {
    const task = taskToAttach;
    if (!task || !user) return;

    const token = localStorage.getItem("token");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`/api/tarefas/${task.id}/anexos`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || data.message != "Success") {
        throw new Error(data.message || "Erro ao enviar anexo");
      }

      // Atualize o estado com o fileUrl retornado
      setData((prev) => {
        const updatedColumns = prev.columns.map((col) => ({
          ...col,
          tasks: col.tasks.map((t) =>
            t.id === task.id ? { ...t, attachments: [...(t.attachments || []), data.fileUrl] } : t
          ),
        }));
        return { columns: updatedColumns };
      });

      addNotification("Anexo enviado", `Arquivo adicionado à tarefa "${task.title}".`);

    } catch (err) {
      addNotification("Erro", "Falha ao enviar anexo.");
      console.error(err);
      console.log("Deu erro, mesmo o arquivo sendo enviado para o diretório");
    }
  };


  const handleOpenAttachmentDialog = (task: Task) => {
    setTaskToAttach(task)
    setAttachmentDialogOpen(true)
  }

  const handleOpenAttachmentViewDialog = (task: Task) => {
    setTaskToViewAttachments(task)
    setAttachmentViewDialogOpen(true)
  }
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
  
    // Capturar menções no comentário
    const mentionRegex = /@([a-zA-Z0-9_]+)/g;
    const extractMentions = (text: string) => {
      const matches = text.match(mentionRegex);
      return matches ? matches.map((match) => match.substring(1).trim()) : [];
    };
  
    const extractedMentions = extractMentions(commentText);
    console.log("Menções capturadas:", extractedMentions);
  
    let mentionedUserIds: string[] = [];
  
    try {
      // Buscar os usuários mencionados
      const responseUsers = await fetch("/api/usuarios", { headers });
      const dataUsers = await responseUsers.json();
      if (responseUsers.ok && dataUsers.success) {
        const users = dataUsers.usuarios || [];
  
        mentionedUserIds = users
          .filter((user: any) =>
            extractedMentions.some(
              (mention) =>
                mention.toLowerCase() === user.firstName.toLowerCase() ||
                mention.toLowerCase() === `${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`
            )
          )
          .map((user: any) => user.id);
  
        console.log("Usuários mencionados identificados (antes do filtro):", mentionedUserIds);
        
        // ✅ Remover o próprio usuário (quem fez o comentário)
        mentionedUserIds = mentionedUserIds.filter((id) => id !== user.id);
        console.log("Usuários mencionados (após remover o autor):", mentionedUserIds);
      }
    } catch (error) {
      console.error("Erro ao buscar usuários mencionados:", error);
    }
  
    // Criação do comentário localmente
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText,
      author: user.name,
      createdAt: new Date(),
    };
  
    try {
      // Enviar o comentário para o backend com as menções
      const response = await fetch(`/api/tarefas/${taskId}/comentarios`, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          text: commentText,
          author: user.name,
          mentionedUserIds,
        }),
      });
  
      const data = await response.json();
  
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao adicionar comentário.");
      }
  
      // ✅ Atualizar localmente a lista de tarefas com o novo comentário
      setData((prevData) => {
        const updatedColumns = prevData.columns.map((column) => {
          const updatedTasks = column.tasks.map((task) => {
            if (task.id === taskId) {
              return {
                ...task,
                comments: [newComment, ...task.comments],
              };
            }
            return task;
          });
          return { ...column, tasks: updatedTasks };
        });
        return { columns: updatedColumns };
      });
  
      // ✅ Atualizar a lista de comentários no diálogo diretamente
      setSelectedTask((prevTask) => {
        if (prevTask && prevTask.id === taskId) {
          return {
            ...prevTask,
            comments: [newComment, ...prevTask.comments],
          };
        }
        return prevTask;
      });
  
      // ✅ Notificar apenas os usuários mencionados (excluindo o autor)
      if (mentionedUserIds.length > 0) {
        addNotification(
          "Você foi mencionado!",
          `Você foi mencionado em um comentário na tarefa "${taskId}".`,
          mentionedUserIds
        );
      }
  
      addNotification("Comentário adicionado", `Seu comentário foi adicionado à tarefa.`);
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      addNotification("Erro ao adicionar comentário", "Não foi possível adicionar o comentário.");
    }
  };

  
  const handleSaveTask = async (taskId: string, updatedTask: any) => {
    if (!user) {
      addNotification("Erro", "Você precisa estar logado para atualizar a tarefa.")
      return false
    }

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


      if (!response.ok || !data.success) {
        throw new Error(data.message || "Erro ao atualizar tarefa.")
      }

      // Se a atualização for bem-sucedida, retorna para o diálogo
      addNotification(`Tarefa atualizada`, `Usuário ${user?.name} atualizou a tarefa ${selectedTask?.title} para ${updatedTask.title}`)
      return true
    } catch (error) {
      addNotification(`Erro ao atualizar tarefa`, `Usuário ${user?.name} não possui permissão para atualizar a tarefa: ${selectedTask?.title}! Tente novamente.`);
      throw error
    }
  }


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
      addNotification(
        "Tarefa excluída",
        `O usuário ${user?.name} excluiu a tarefa "${selectedTask.title}" para o cliente ${selectedTask.client}`,
      )
    }, 0)

    setDeleteDialogOpen(false)
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

  // Tipagem das colunas
  type Column = {
    id: string;
    title: string;
    tasks: Task[];
  };

  const handleDragEnd = useCallback(async (event: DragEndEvent) => {
    const { active, over } = event;

    // Se a tarefa não foi solta em um drop zone válido
    if (!over) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;

    // Verifique se data.columns está disponível
    if (!data || !data.columns) {
      console.error("Data ou data.columns não está definido", data);
      return;
    }

    // Encontre a tarefa e a coluna onde ela estava
    const { task: activeTask, column: activeColumn } = findTaskById(activeId);
    if (!activeTask || !activeColumn) {
      setActiveId(null);
      setActiveTask(null);
      return;
    }

    // Verificar se a coluna de destino existe
    const targetColumn = data.columns.find((col) => col.id === overId);
    if (!targetColumn) return; // Caso a coluna de destino não exista

    // Se a tarefa foi movida para uma coluna diferente
    if (activeColumn.id !== overId) {
      const updatedTask: Task = {
        ...activeTask,
        status: overId as Task["status"],
        completedAt: overId === "completed" && !activeTask.completedAt ? new Date().toISOString() : activeTask.completedAt,
      };

      // Atualize o estado visualmente
      setData((prev) => {
        const updatedColumns = prev.columns.map((column: Column) => {
          if (column.id === activeColumn.id) {
            return {
              ...column,
              tasks: column.tasks.filter((task) => task.id !== activeId), // Remove da coluna original
            };
          }
          if (column.id === overId) {
            return {
              ...column,
              tasks: [...column.tasks, updatedTask], // Adiciona à nova coluna
            };
          }
          return column;
        });

        return { columns: updatedColumns };
      });

      // Enviar a requisição PATCH para atualizar a tarefa no backend
      try {
        const token = localStorage.getItem("token");
        if (!token) throw new Error("Token não encontrado");

        const response = await fetch(`/api/tarefas/${activeTask.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            status: overId,
            completedAt: updatedTask.completedAt,
          }),
        });

        const dataResponse = await response.json();

        if (!response.ok || !dataResponse.success) {
          throw new Error("Erro ao atualizar status da tarefa.");
        }

        // Se a atualização for bem-sucedida, disparar notificação de sucesso
        setTimeout(() => {
          addNotification("Status de tarefa atualizado", `A tarefa "${activeTask.title}" foi movida para ${targetColumn.title} pelo usuário ${user?.name}.`);
        }, 0);
      } catch (err) {
        console.error("Erro ao atualizar status da tarefa:", err);

        // Reverter para a posição original caso falhe
        setData((prev) => {
          const updatedColumns = prev.columns.map((column: Column) => {
            if (column.id === activeColumn.id) {
              return {
                ...column,
                tasks: [...column.tasks, activeTask], // Retorna à coluna original
              };
            }
            if (column.id === overId) {
              return {
                ...column,
                tasks: column.tasks.filter((task) => task.id !== activeId), // Remove da coluna de destino
              };
            }
            return column;
          });

          return { columns: updatedColumns };
        });

        // Disparar notificação de erro
        addNotification("Erro ao atualizar tarefa!", `O usuário ${user?.name} não possui permissão para atualizar a tarefa.`);
      }
    }
  }, [data.columns, findTaskById, addNotification, user]);

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
              onUploadAttachment={handleOpenAttachmentDialog}
              onViewAttachments={handleOpenAttachmentViewDialog} // ✅ aqui
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

      {/* Diálogo de anexo */}
      {taskToAttach && (
        <AttachmentDialog
          open={attachmentDialogOpen}
          onOpenChange={setAttachmentDialogOpen}
          onUpload={handleUploadAttachment}
        />
      )}

      {taskToViewAttachments && (
        <AttachmentViewDialog
          open={attachmentViewDialogOpen}
          onOpenChange={setAttachmentViewDialogOpen}
          task={taskToViewAttachments}
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
        onConfirm={() => selectedTask && handleArchiveTask(selectedTask)}  // Verifica se selectedTask não é null
        confirmText="Sim, arquivar"
        cancelText="Cancelar"
      />
    </>
  )
}
