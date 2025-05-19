"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useNotifications } from "./notification-provider"
import { useAuth } from "./auth-provider"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"

interface ProjectFormProps {
  projectId?: string
}

export function ProjectForm({ projectId }: ProjectFormProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [client, setClient] = useState("")
  const [entity, setEntity] = useState("")
  const [status, setStatus] = useState("pending")
  const [initDate, setInitDate] = useState<string>("")
  const [completeDate, setCompleteDate] = useState<string>("")
  const [membersTeam, setMembersTeam] = useState<string[]>([]) // Inicializa como um array vazio
  const [searchQuery, setSearchQuery] = useState("") // Estado para pesquisa
  const [filteredUsers, setFilteredUsers] = useState<{ id: string, firstName: string, lastName: string }[]>([]) // Usuários filtrados com base na pesquisa
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(!!projectId)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  const [availableClients, setAvailableClients] = useState<{ id: string; name: string; entities: string[] }[]>([])
  const [availableEntities, setAvailableEntities] = useState<{ id: string; name: string }[]>([])
  const [availableUsers, setAvailableUsers] = useState<{ id: string; firstName: string; lastName: string }[]>([])  // Agora com firstName e lastName

  // 1. Carregar listas de Entidades, Clientes e Usuários
  useEffect(() => {
    const loadData = async () => {
      const token = localStorage.getItem("token")
      const headers = {
        Authorization: `Bearer ${token}`,
      }

      try {
        const responseEntities = await fetch("/api/entidades", { headers })
        const entidadesData = await responseEntities.json()
        setAvailableEntities(entidadesData.entidades)

        const responseClients = await fetch("/api/clientes", { headers })
        const clientesData = await responseClients.json()
        setAvailableClients(clientesData.clientes)

        const responseUsers = await fetch("/api/usuarios", { headers })  // Assumindo que exista uma API para usuários
        const usersData = await responseUsers.json()
        setAvailableUsers(usersData.usuarios)

      } catch (error) {
        console.error("Erro ao carregar dados:", error)
        toast({
          title: "Erro ao carregar dados",
          description: "Verifique sua conexão ou permissões.",
          variant: "destructive",
        })
      }
    }
    loadData()
  }, [])

  // 2. Carregar dados do projeto para edição (se projectId estiver presente)
  useEffect(() => {
    if (projectId) {
      const loadProject = async () => {
        try {
          const token = localStorage.getItem("token")
          const headers = {
            Authorization: `Bearer ${token}`,
          }

          const response = await fetch(`/api/projetos/${projectId}`, { headers })
          const data = await response.json()

          if (!response.ok || !data.success) {
            throw new Error(data.message || "Erro ao buscar projeto")
          }

          const project = data.project

          // Atualiza o estado com os dados do projeto
          setName(project.name)
          setDescription(project.description)
          setClient(project.client)
          setEntity(project.entity)
          setStatus(project.status)
          setInitDate(project.initDate || "")
          setCompleteDate(project.completeDate || "")
          setMembersTeam(project.membersTeam || [])

        } catch (error) {
          toast({
            title: "Erro ao carregar projeto",
            description: "Não foi possível carregar os dados do projeto.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingData(false) // Atualiza o estado para falso depois do carregamento
        }
      }

      loadProject()
    }
  }, [projectId, toast])

  // Filtrar clientes com base na entidade selecionada
  const filteredClients = entity ? availableClients.filter((c) => c.entities.includes(entity)) : availableClients

  // Função para lidar com a seleção de membros da equipe
  const handleMemberChange = (id: string) => {
    setMembersTeam((prev) => {
      if (prev.includes(id)) {
        return prev.filter((memberId) => memberId !== id) // Remove o membro da seleção
      } else {
        return [...prev, id] // Adiciona o membro à seleção
      }
    })
  }

  // 3. Função para filtrar usuários com base na pesquisa
  useEffect(() => {
    const lowerCaseQuery = searchQuery.toLowerCase()
    const filtered = availableUsers.filter((user) =>
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(lowerCaseQuery)
    )
    setFilteredUsers(filtered)
  }, [searchQuery, availableUsers])

  // 4. Função para salvar ou atualizar o projeto
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const clientName = availableClients.find((c) => c.id === client)?.name || "Cliente"
      const entityName = availableEntities.find((e) => e.id === entity)?.name || "Entidade"

      const token = localStorage.getItem("token")
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      }

      const projectData = {
        name,
        description,
        client,
        entity,
        status,
        initDate,
        completeDate,
        membersTeam,
      }

      if (projectId) {
        // Se existe projectId, significa que é uma atualização (PUT)
        const response = await fetch(`/api/projetos/${projectId}`, {
          method: "PUT",
          headers,
          body: JSON.stringify(projectData),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Erro ao atualizar projeto.")
        }

        toast({
          title: "Projeto atualizado com sucesso",
          description: "As informações do projeto foram atualizadas.",
        })

        addNotification(
          "Projeto atualizado",
          `O projeto "${name}" foi atualizado com sucesso.`
        )

        // Redireciona para a página de detalhes do projeto
        router.push(`/dashboard/projects/${projectId}`)
      } else {
        // Se não existe projectId, significa que é uma criação (POST)
        const response = await fetch("/api/projetos", {
          method: "POST",
          headers,
          body: JSON.stringify(projectData),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          throw new Error(data.message || "Erro ao criar projeto.")
        }

        toast({
          title: "Projeto criado com sucesso",
          description: "O projeto foi adicionado ao sistema.",
        })

        addNotification(
          "Novo projeto criado",
          `O projeto "${name}" foi criado com sucesso pelo usuário ${user?.name}`
        )

        // Redireciona para a página de lista de projetos
        router.push("/dashboard/projects")
      }
    } catch (error) {
      toast({
        title: projectId ? "Erro ao atualizar projeto" : "Erro ao criar projeto",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
      addNotification(
        "Erro ao criar projeto",
        `Erro ao ${projectId ? "atualizar" : "criar"} projeto "${name}".`,
      )
    } finally {
      setIsLoading(false)
    }
  }

  // Exibir tela de carregamento enquanto isLoadingData é verdadeiro
  if (isLoadingData) {
    return <div className="flex justify-center p-4">Carregando...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome do Projeto</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="description">Descrição</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="initDate">Data de Início</Label>
          <Input
            type="date"
            id="initDate"
            value={initDate}
            onChange={(e) => setInitDate(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="completeDate">Data de Conclusão</Label>
          <Input
            type="date"
            id="completeDate"
            value={completeDate}
            onChange={(e) => setCompleteDate(e.target.value)}
            required
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="entity">Entidade Responsável</Label>
          <Select
            value={entity}
            onValueChange={(value) => {
              setEntity(value)
              setClient("") // Resetar cliente quando a entidade muda
            }}
            required
          >
            <SelectTrigger id="entity">
              <SelectValue placeholder="Selecione uma entidade" />
            </SelectTrigger>
            <SelectContent>
              {availableEntities.length > 0 ? (
                availableEntities.map((entity) => (
                  <SelectItem key={entity.id} value={entity.id}>
                    {entity.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhuma entidade disponível.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="client">Cliente</Label>
          <Select value={client} onValueChange={setClient} required disabled={!entity}>
            <SelectTrigger id="client">
              <SelectValue placeholder={entity ? "Selecione um cliente" : "Selecione uma entidade primeiro"} />
            </SelectTrigger>
            <SelectContent>
              {filteredClients.length > 0 ? (
                filteredClients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhum cliente disponível.
                </div>
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="status">Status</Label>
          <Select value={status} onValueChange={setStatus} required>
            <SelectTrigger id="status">
              <SelectValue placeholder="Selecione um status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="in-progress">Em andamento</SelectItem>
              <SelectItem value="completed">Finalizado</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="membersTeam">Membros da Equipe</Label>
          <div>
            {/* Campo de pesquisa para filtrar membros da equipe */}
            <Input
              placeholder="Pesquisar membros..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {/* Lista de membros filtrados */}
            <div style={{ maxHeight: "300px", overflowY: "auto" }}>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <div key={user.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id={user.id}
                      checked={membersTeam.includes(user.id)}
                      onChange={() => handleMemberChange(user.id)}
                    />
                    <label htmlFor={user.id}>{user.firstName} {user.lastName}</label>
                  </div>
                ))
              ) : (
                <div className="px-2 py-2 text-sm text-muted-foreground">
                  Nenhum membro encontrado.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Salvando..." : projectId ? "Atualizar projeto" : "Criar projeto"}
        </Button>
      </div>
    </form>
  )
}
