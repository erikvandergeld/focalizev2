"use client";

import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { CommentDialog } from "./comment-dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Task } from "./kanban-board";

// Dados de exemplo
const archivedTasks: any[] = [];

export function ArchivedTaskList() {
  const [archivedTasks, setArchivedTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState(""); // Estado para a pesquisa
  const [commentDialogOpen, setCommentDialogOpen] = useState(false); // Estado para o dialog de comentários
  const [selectedTask, setSelectedTask] = useState<any | null>(null); // Estado para a tarefa selecionada

  useEffect(() => {
    // Carregar todas as tarefas arquivadas do backend ou do estado global
    const fetchArchivedTasks = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await fetch("/api/tarefas/arquivada", { // URL correta do endpoint
          method: "GET",
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await response.json();
        if (data.success) {
          setArchivedTasks(data.tasks || []);
        }
      } catch (error) {
        console.error("Erro ao carregar tarefas arquivadas", error);
      }
    };

    fetchArchivedTasks();
  }, []);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-"; // Se for null, retorna um valor padrão
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const formatArchiveTime = (dateString: string | null) => {
    if (!dateString) return "-"; // Se for null, retorna um valor padrão
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR });
  };

  const handleOpenCommentDialog = (task: any) => {
    setSelectedTask(task);
    setCommentDialogOpen(true);
  };

  // Filtrar tarefas com base na pesquisa
  const filteredTasks = archivedTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.client.toLowerCase().includes(search.toLowerCase()) ||
      (task.assignee &&
        typeof task.assignee !== "string" &&
        task.assignee?.full_name.toLowerCase().includes(search.toLowerCase())) || // Verificação de `assignee`
      task.entity.toLowerCase().includes(search.toLowerCase()) ||
      (task.project && task.project.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <>
      <div className="mb-4 w-full">
        <div className="relative w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tarefas arquivadas..."
            className="w-full pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpar</span>
            </Button>
          )}
        </div>
      </div>

      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Responsável</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Concluída em</TableHead>
              <TableHead>Arquivada</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTasks.map((task) => (
              <TableRow key={task.id}>
                <TableCell className="font-medium">{task.title}</TableCell>
                <TableCell>{task.client}</TableCell>
                <TableCell>
                  {/* Verificação se assignee é null ou objeto */}
                  {task.assignee ? (
                    typeof task.assignee === "string" ? (
                      task.assignee
                    ) : (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                          <AvatarFallback className="text-xs">
                            {task.assignee.full_name.split(" ").map((n: string) => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        {task.assignee.full_name}
                      </div>
                    )
                  ) : (
                    "Sem responsável"
                  )}
                </TableCell>
                <TableCell>{task.entity_name}</TableCell>
                <TableCell>{task.project || "-"}</TableCell>
                <TableCell>
                  <Badge variant={task.taskType === "administrative" ? "default" : "secondary"}>
                    {task.taskType === "administrative" ? "Administrativo" : "Técnico"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(task.completedAt)}</TableCell>
                <TableCell>{formatArchiveTime(task.archivedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenCommentDialog(task)}>
                    <Eye className="h-4 w-4" />
                    Detalhes
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredTasks.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  Nenhuma tarefa arquivada encontrada.
                </TableCell>
              </TableRow>
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
          onAddComment={() => {}} // Desabilitado para tarefas arquivadas
        />
      )}
    </>
  );
}
