"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "./confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNotifications } from "./notification-provider"

// Dados de exemplo
const projects: any[] = []

export function ProjectList() {
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const [projectList, setProjectList] = useState(projects)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return <Badge variant="outline">Pendente</Badge>
      case "in-progress":
        return <Badge variant="secondary">Em andamento</Badge>
      case "completed":
        return <Badge variant="default">Finalizado</Badge>
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

  const handleView = (id: string) => {
    router.push(`/dashboard/projects/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/projects/${id}/edit`)
  }

  const handleOpenDeleteDialog = (project: any) => {
    setSelectedProject(project)
    setDeleteDialogOpen(true)
  }

  const handleDeleteProject = () => {
    if (!selectedProject) return

    setProjectList((prev) => prev.filter((project) => project.id !== selectedProject.id))

    toast({
      title: "Projeto excluído",
      description: `O projeto "${selectedProject.name}" foi excluído com sucesso.`,
    })

    addNotification(
      "Projeto excluído",
      `O projeto "${selectedProject.name}" para o cliente ${selectedProject.client} foi excluído.`,
    )

    setDeleteDialogOpen(false)
    setSelectedProject(null)
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Tarefas</TableHead>
              <TableHead>Data de criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectList.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.entity}</TableCell>
                <TableCell>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {project.client}
                  </span>
                </TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell>
                  <span className="text-sm">
                    {project.completedTasks}/{project.tasksCount}
                  </span>
                </TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Ações
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleView(project.id)}>
                        <Eye className="h-4 w-4" />
                        <span>Visualizar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleEdit(project.id)}>
                        <Pencil className="h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive"
                        onClick={() => handleOpenDeleteDialog(project)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmação para excluir projeto */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir projeto"
        description={`Tem certeza que deseja excluir o projeto "${selectedProject?.name}"? Esta ação não pode ser desfeita e todas as tarefas associadas serão desvinculadas.`}
        onConfirm={handleDeleteProject}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </>
  )
}
