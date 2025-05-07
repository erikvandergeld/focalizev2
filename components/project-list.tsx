"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ConfirmDialog } from "./confirm-dialog"
import { useToast } from "@/components/ui/use-toast"
import { useNotifications } from "./notification-provider"

export function ProjectList() {
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  const [projectList, setProjectList] = useState<any[]>([])
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedProject, setSelectedProject] = useState<any | null>(null)

  // ✅ Buscar os projetos do backend
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/projetos", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()

        if(!token){
          toast({
            title: "Erro",
            description: "Você não está autenticado.",
            variant: "destructive",
        })}
        
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Erro ao carregar projetos")
        }

        setProjectList(data.projetos)
      } catch (error) {
        toast({
          title: "Erro",
          description: "Não foi possível carregar os projetos.",
          variant: "destructive",
        })
      }
    }

    fetchProjects()
  }, [toast])

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

  const handleView = (id: string) => router.push(`/dashboard/projects/${id}`)
  const handleEdit = (id: string) => router.push(`/dashboard/projects/${id}/edit`)
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
      `O projeto "${selectedProject.name}" foi removido.`,
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
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projectList.map((project) => (
              <TableRow key={project.id}>
                <TableCell className="font-medium">{project.name}</TableCell>
                <TableCell>{project.entity_name}</TableCell>
                <TableCell>
                  <span className="text-sm">{project.client}</span>
                </TableCell>
                <TableCell>{getStatusBadge(project.status)}</TableCell>
                <TableCell>{formatDate(project.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">Ações</Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(project.id)}>
                        <Eye className="h-4 w-4 mr-2" /> Visualizar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleEdit(project.id)}>
                        <Pencil className="h-4 w-4 mr-2" /> Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleOpenDeleteDialog(project)} className="text-destructive">
                        <Trash2 className="h-4 w-4 mr-2" /> Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir projeto"
        description={`Tem certeza que deseja excluir o projeto "${selectedProject?.name}"?`}
        onConfirm={handleDeleteProject}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </>
  )
}
