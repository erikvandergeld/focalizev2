"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { useNotifications } from "./notification-provider"
import { Checkbox } from "@/components/ui/checkbox"

// Dados de exemplo para clientes
const clientsData: Record<string, any> = {}

interface ClientFormProps {
  clientId?: string
}

export function ClientForm({ clientId }: ClientFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [company, setCompany] = useState("")
  const [notes, setNotes] = useState("")
  const [selectedEntities, setSelectedEntities] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingData, setIsLoadingData] = useState(!!clientId)
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()

  // Remover os dados de exemplo para entidades
  const [availableEntities, setAvailableEntities] = useState<{ id: string; name: string }[]>([])

  // Adicionar useEffect para carregar entidades (simulação)
  useEffect(() => {
    // Em um sistema real, isso seria uma chamada à API
    // Por enquanto, deixamos vazio para ser preenchido pelo backend
    const loadEntities = async () => {
      // Simulação de carregamento de dados
      await new Promise((resolve) => setTimeout(resolve, 300))
      // Deixamos vazio para ser preenchido pelo backend
      setAvailableEntities([])
    }

    loadEntities()
  }, [])

  // Carregar dados do cliente se estiver editando
  useEffect(() => {
    if (clientId) {
      const loadClient = async () => {
        try {
          // Simulação de carregamento de dados
          await new Promise((resolve) => setTimeout(resolve, 500))

          const client = clientsData[clientId as keyof typeof clientsData]
          if (client) {
            setName(client.name)
            setEmail(client.email)
            setPhone(client.phone)
            setCompany(client.company)
            setNotes(client.notes)
            setSelectedEntities(client.entities)
          }
        } catch (error) {
          toast({
            title: "Erro ao carregar cliente",
            description: "Não foi possível carregar os dados do cliente.",
            variant: "destructive",
          })
        } finally {
          setIsLoadingData(false)
        }
      }

      loadClient()
    }
  }, [clientId, toast])

  const toggleEntity = (entityId: string) => {
    setSelectedEntities((prev) =>
      prev.includes(entityId) ? prev.filter((id) => id !== entityId) : [...prev, entityId],
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedEntities.length === 0 && availableEntities.length > 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma entidade para o cliente.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      // Simulação de envio para API
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Obter os nomes das entidades selecionadas
      const entityNames = selectedEntities
        .map((id) => availableEntities.find((e) => e.id === id)?.name)
        .filter(Boolean)
        .join(", ")

      if (clientId) {
        toast({
          title: "Cliente atualizado com sucesso",
          description: "As informações do cliente foram atualizadas.",
        })

        // Adicionar notificação
        addNotification("Cliente atualizado", `O cliente "${name}" foi atualizado com sucesso.`)

        router.push(`/dashboard/clients/${clientId}`)
      } else {
        toast({
          title: "Cliente cadastrado com sucesso",
          description: "O cliente foi adicionado ao sistema.",
        })

        // Adicionar notificação
        addNotification(
          "Novo cliente cadastrado",
          `O cliente "${name}" foi cadastrado com sucesso${entityNames ? ` para as entidades: ${entityNames}` : ""}.`,
        )

        router.push("/dashboard/clients")
      }
    } catch (error) {
      toast({
        title: clientId ? "Erro ao atualizar cliente" : "Erro ao cadastrar cliente",
        description: "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoadingData) {
    return <div className="flex justify-center p-4">Carregando...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid gap-2">
          <Label htmlFor="name">Nome</Label>
          <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">Telefone</Label>
            <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="company">Empresa</Label>
          <Input id="company" value={company} onChange={(e) => setCompany(e.target.value)} />
        </div>

        <div className="grid gap-2">
          <Label>Entidades Associadas</Label>
          <div className="border rounded-md p-4 space-y-2">
            {availableEntities.length > 0 ? (
              availableEntities.map((entity) => (
                <div key={entity.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`entity-${entity.id}`}
                    checked={selectedEntities.includes(entity.id)}
                    onCheckedChange={() => toggleEntity(entity.id)}
                  />
                  <Label htmlFor={`entity-${entity.id}`} className="text-sm font-normal cursor-pointer">
                    {entity.name}
                  </Label>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Nenhuma entidade disponível. Adicione entidades nas configurações.
              </p>
            )}
          </div>
          {selectedEntities.length === 0 && availableEntities.length > 0 && (
            <p className="text-sm text-destructive">Selecione pelo menos uma entidade</p>
          )}
        </div>

        <div className="grid gap-2">
          <Label htmlFor="notes">Observações</Label>
          <Textarea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading || (selectedEntities.length === 0 && availableEntities.length > 0)}>
          {isLoading ? "Salvando..." : clientId ? "Atualizar cliente" : "Salvar cliente"}
        </Button>
      </div>
    </form>
  )
}
