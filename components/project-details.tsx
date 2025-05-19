"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { toast } from "@/components/ui/use-toast" // Importando a função toast

interface User {
  id: string
  name: string
}

interface ProjectDetailsProps {
  id: string
}

export function ProjectDetails({ id }: ProjectDetailsProps) {
  const [project, setProject] = useState<any>(null)
  const [availableUsers, setAvailableUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadProject = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) throw new Error("Token não encontrado")

        const headers = {
          Authorization: `Bearer ${token}`,
        }

        // Buscar projeto
        const responseProject = await fetch(`/api/projetos/${id}`, { headers })
        if (!responseProject.ok) {
          const errorData = await responseProject.json()
          throw new Error(errorData.message || "Erro ao buscar projeto")
        }
        const dataProject = await responseProject.json()
        if (!dataProject.success || !dataProject.project || dataProject.project.length === 0) {
          throw new Error(dataProject.message || "Erro ao buscar projeto")
        }
        setProject(dataProject.project)


        // Buscar usuários para membros da equipe
        const responseUsers = await fetch("/api/usuarios", { headers })
        if (!responseUsers.ok) {
          toast({ title: "Falha ao carregar usuários" })
          setAvailableUsers([])
        } else {
          const dataUsers = await responseUsers.json()
          // Supondo que a API retorne algo tipo { usuarios: [...] }
          setAvailableUsers(
            (dataUsers.usuarios || []).map((u: any) => ({
              id: u.id,
              name: `${u.firstName} ${u.lastName}`.trim(),
            }))
          )
        }
      } catch (error: any) {
        console.error("Erro ao carregar projeto:", error)
        toast({ title: "Erro ao carregar projeto", description: error.message, variant: "destructive" })
      } finally {
        setIsLoading(false)
      }
    }

    loadProject()
  }, [id])

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando...</div>
  }

  if (!project) {
    return <div className="flex justify-center p-4">Projeto não encontrado</div>
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não definido"
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

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

  // Função para pegar nome do usuário pelo id
  const getUserNameById = (id: string) => {
    const user = availableUsers.find((u) => u.id === id)
    return user ? user.name : id
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="grid grid-cols-2">
                <dt className="font-medium">Nome:</dt>
                <dd>{project.name || "Nome não disponível"}</dd>
              </div>

              <div className="grid grid-cols-2">
                <dt className="font-medium">Cliente:</dt>
                <dd>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {project.client_name || "Cliente não definido"}
                  </span>
                </dd>
              </div>

              <div className="grid grid-cols-2">
                <dt className="font-medium">Entidade:</dt>
                <dd>{project.entity_name || "Entidade não definida"}</dd>
              </div>

              <div className="grid grid-cols-2">
                <dt className="font-medium">Status:</dt>
                <dd>{getStatusBadge(project.status) || "Status não definido"}</dd>
              </div>

              <div className="grid grid-cols-2">
                <dt className="font-medium">Data de início:</dt>
                <dd>{formatDate(project.initDate) || "Data não definida"}</dd>
              </div>

              <div className="grid grid-cols-2">
                <dt className="font-medium">Data de conclusão:</dt>
                <dd>{formatDate(project.completeDate) || "Data não definida"}</dd>
              </div>

              <div className="grid grid-cols-2">
                <dt className="font-medium">Data de criação:</dt>
                <dd>{formatDate(project.createdAt) || "Data não definida"}</dd>
              </div>

              <div className="grid grid-cols-2">
                <dt className="font-medium">Membros da equipe:</dt>
                <dd>
                  {project.membersTeam && project.membersTeam.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {project.membersTeam.map((id: string) => (
                        <li key={id}>{getUserNameById(id) || "Membro não encontrado"}</li>
                      ))}
                    </ul>
                  ) : (
                    <span>Nenhum membro designado</span>
                  )}
                </dd>
              </div>

              <div className="col-span-2">
                <dt className="font-medium mb-1">Descrição:</dt>
                <dd className="bg-muted p-2 rounded">{project.description || "Sem descrição"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{project.activeTasks?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Tarefas ativas</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{project.completeTasks?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Tarefas concluídas</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">
                  {(project.activeTasks?.length || 0) + (project.completeTasks?.length || 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total de tarefas</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">{project.membersTeam?.length || 0}</div>
                <div className="text-sm text-muted-foreground">Membros da equipe</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tasks">
        <TabsList>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas do Projeto</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList projectId={id} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Exemplo estático */}
                <div className="flex items-start gap-4">
                  <div className="min-w-24 text-sm text-muted-foreground">{formatDate("2023-05-10T10:00:00Z")}</div>
                  <div>
                    <p className="text-sm font-medium">Tarefa concluída</p>
                    <p className="text-sm text-muted-foreground">Análise de requisitos para o novo sistema</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
