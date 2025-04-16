"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { TaskList } from "@/components/task-list"
import { useToast } from "@/components/ui/use-toast"

interface ClientDetailsProps {
  id: string
}

export function ClientDetails({ id }: ClientDetailsProps) {
  const [client, setClient] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await fetch(`/api/clientes/${id}`)
        const data = await response.json()

        if (response.ok && data.success) {
          setClient(data.client)
        } else {
          toast({
            title: "Erro ao carregar cliente",
            description: data.message || "Não foi possível encontrar o cliente.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao buscar cliente:", error)
        toast({
          title: "Erro ao carregar cliente",
          description: "Erro ao se conectar com o servidor.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchClient()
  }, [id, toast])

  if (isLoading) {
    return <div className="flex justify-center p-4">Carregando...</div>
  }

  if (!client) {
    return <div className="flex justify-center p-4">Cliente não encontrado</div>
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Informações do Cliente</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 gap-4 text-sm">
              <div className="grid grid-cols-2">
                <dt className="font-medium">Nome:</dt>
                <dd>{client.name}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Email:</dt>
                <dd>{client.email}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Telefone:</dt>
                <dd>{client.phone}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Empresa:</dt>
                <dd>{client.company}</dd>
              </div>
              <div className="grid grid-cols-2">
                <dt className="font-medium">Data de cadastro:</dt>
                <dd>{formatDate(client.createdAt)}</dd>
              </div>
              <div className="col-span-2">
                <dt className="font-medium mb-1">Observações:</dt>
                <dd className="bg-muted p-2 rounded">{client.notes || "Nenhuma observação"}</dd>
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
                <div className="text-3xl font-bold">2</div>
                <div className="text-sm text-muted-foreground">Projetos ativos</div>
              </div>
              <div className="bg-muted p-4 rounded-lg text-center">
                <div className="text-3xl font-bold">8</div>
                <div className="text-sm text-muted-foreground">Meses de contrato</div>
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
              <CardTitle>Tarefas do Cliente</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskList />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="history" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Atividades</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">Histórico real ainda não implementado.</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
