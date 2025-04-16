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

  useEffect(() => {
    const loadEntities = async () => {
      try {
        const response = await fetch("/api/entidades")
        const data = await response.json()

        if (response.ok && data.success && Array.isArray(data.entidades)) {
          setAvailableEntities(data.entidades)
        } else {
          toast({
            title: "Erro ao carregar entidades",
            description: data.message || "Não foi possível carregar as entidades.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao buscar entidades:", error)
        toast({
          title: "Erro ao carregar entidades",
          description: "Erro ao se conectar com o servidor.",
          variant: "destructive",
        })
      }
    }

    loadEntities()
  }, [toast])


  // Carregar dados do cliente se estiver editando
  useEffect(() => {
    if (clientId) {
      const loadClient = async () => {
        try {
          const response = await fetch(`/api/clientes/${clientId}`)
          const data = await response.json()

          if (!response.ok || !data.success || !data.client) {
            throw new Error(data.message || "Erro ao buscar cliente.")
          }

          const client = data.client
          setName(client.name || "")
          setEmail(client.email || "")
          setPhone(client.phone || "")
          setCompany(client.company || "")
          setNotes(client.notes || "")
          setSelectedEntities(Array.isArray(client.entities) ? client.entities : [])
        } catch (error) {
          console.error("Erro ao carregar cliente:", error)
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

    if (selectedEntities.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma entidade para o cliente.",
        variant: "destructive",
      })
      return
    }

    if (!name.trim() || !email.trim() || !phone.trim()) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const payload = {
      id: clientId || `client-${Date.now()}`,
      name,
      email,
      phone,
      company: company || "",
      notes: notes || "",
      entities: selectedEntities,
    }

    try {
      const response = await fetch(`/api/clientes${clientId ? `/${clientId}` : ""}`, {
        method: clientId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`, // ✅ aqui
        },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast({
          title: "Erro",
          description: data.message || "Erro ao salvar o cliente.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: clientId ? "Cliente atualizado" : "Cliente cadastrado",
        description: data.message,
      })

      router.push("/dashboard/clients")
    } catch (error) {
      console.error("Erro ao salvar cliente:", error)
      toast({
        title: "Erro",
        description: "Erro ao se conectar com o servidor.",
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
