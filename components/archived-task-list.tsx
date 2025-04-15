"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, Search, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { CommentDialog } from "./comment-dialog"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

// Dados de exemplo
const archivedTasks: any[] = []

export function ArchivedTaskList() {
  const [search, setSearch] = useState("")
  const [commentDialogOpen, setCommentDialogOpen] = useState(false)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const formatArchiveTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true, locale: ptBR })
  }

  const handleOpenCommentDialog = (task: any) => {
    setSelectedTask(task)
    setCommentDialogOpen(true)
  }

  // Filtrar tarefas com base na pesquisa
  const filteredTasks = archivedTasks.filter(
    (task) =>
      task.title.toLowerCase().includes(search.toLowerCase()) ||
      task.client.toLowerCase().includes(search.toLowerCase()) ||
      task.assignee.toLowerCase().includes(search.toLowerCase()) ||
      task.entity.toLowerCase().includes(search.toLowerCase()) ||
      (task.project && task.project.toLowerCase().includes(search.toLowerCase())),
  )

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
                <TableCell>{task.entity}</TableCell>
                <TableCell>
                  {task.project ? (
                    <Badge variant="outline">{task.project}</Badge>
                  ) : (
                    <span className="text-muted-foreground text-sm">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant={task.isAdministrative ? "default" : "secondary"}>
                    {task.isAdministrative ? "Administrativo" : "Técnico"}
                  </Badge>
                </TableCell>
                <TableCell>{formatDate(task.completedAt)}</TableCell>
                <TableCell>{formatArchiveTime(task.archivedAt)}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleOpenCommentDialog(task)} className="gap-1">
                    <Eye className="h-4 w-4" />
                    <span>Detalhes</span>
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
  )
}
