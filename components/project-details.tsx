"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"

interface ProjectDetailsProps {
  id: string
}

// Dados de exemplo
const projectData: Record<string, any> = {}

export function ProjectDetails({ id }: ProjectDetailsProps) {
  const [project, setProject] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulação de carregamento de dados
    const loadProject = async () => {
      await new Promise((resolve) => setTimeout(resolve, 500))
      setProject(projectData[id as keyof typeof projectData] || null)
      setIsLoading(false)
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

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Projeto</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2">
                <dt className="font-medium">Nome:</dt>
                <dd>{project.name}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Cliente:</dt>
                <dd>
                  <span className="px-2 py-1 bg-primary/10 text-primary rounded-full text-xs font-medium">
                    {project.client}
                  </span>
                </dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Entidade:</dt>
                <dd>{project.entity}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Status:</dt>
                <dd>{getStatusBadge(project.status)}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Data de início:</dt>
                <dd>{formatDate(project.startDate)}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Data de conclusão:</dt>
                <dd>{formatDate(project.endDate)}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Data de criação:</dt>
                <dd>{formatDate(project.createdAt)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium mb-1">Descrição:</dt>
                <dd className="bg-muted p-2 rounded">{project.description}</dd>
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
                <div className="text-3xl font-bold">3</div>
                <div className="text-sm text-muted-foreground">Tarefas ativas</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">5</div>
                <div className="text-sm text-muted-foreground">Tarefas concluídas</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Total de tarefas</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">2</div>
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
                <div className="flex items-start gap-4">
                  <div className="min-w-24 text-sm text-muted-foreground">{formatDate("2023-05-10T10:00:00Z")}</div>
                  <div>
                    <p className="text-sm font-medium">Tarefa concluída</p>
                    <p className="text-sm text-muted-foreground">Análise de requisitos para o novo sistema</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="min-w-24 text-sm text-muted-foreground">{formatDate("2023-05-05T14:30:00Z")}</div>
                  <div>
                    <p className="text-sm font-medium">Reunião realizada</p>
                    <p className="text-sm text-muted-foreground">Apresentação do projeto e definição de escopo</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="min-w-24 text-sm text-muted-foreground">{formatDate("2023-04-25T11:20:00Z")}</div>
                  <div>
                    <p className="text-sm font-medium">Projeto iniciado</p>
                    <p className="text-sm text-muted-foreground">Início do desenvolvimento</p>
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
