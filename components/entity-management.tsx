"use client"

import { useEffect } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { PlusCircle, Pencil, Trash2 } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "./confirm-dialog"

// Tipos
type Entity = {
  id: string
  name: string
  createdAt: string
}

export function EntityManagement() {
  const [entities, setEntities] = useState<Entity[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [entityName, setEntityName] = useState("")
  const { toast } = useToast()

  const resetForm = () => {
    setEntityName("")
    setSelectedEntity(null)
  }

  const handleOpenDialog = (entity?: Entity) => {
    if (entity) {
      setSelectedEntity(entity)
      setEntityName(entity.name)
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (entity: Entity) => {
    setSelectedEntity(entity)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    // Validação
    if (!entityName.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome da entidade é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (selectedEntity) {
      // Atualizar entidade existente

      const response = await fetch(`/api/entidades/${selectedEntity.id}`, {
        method: 'PUT',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token") || ""}`, // ✅ aqui
        },
        body: JSON.stringify({
          name: entityName,
        }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        toast({
          title: "Erro",
          description: data.message || "Erro ao atualizar a entidade.",
          variant: "destructive",
        })
        return
      }
      // Atualizar a lista de entidades
      setEntities((prev) =>
        prev.map((entity) =>
          entity.id === selectedEntity.id
            ? {
              ...entity,
              name: entityName,
            }
            : entity,
        ),
      )

      toast({
        title: "Entidade atualizada",
        description: `A entidade "${entityName}" foi atualizada com sucesso.`,
      })
    } else {
      // CRIAÇÃO de nova entidade
      try {
        const response = await fetch("/api/entidades", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token") || ""}`, // ✅ aqui
          },
          body: JSON.stringify({
            id: entityName.toLowerCase().replace(/\s+/g, "_"),
            name: entityName,
          }),
        })

        const data = await response.json()

        if (!response.ok || !data.success) {
          toast({
            title: "Erro",
            description: data.message || "Erro ao cadastrar a entidade.",
            variant: "destructive",
          })
          return
        }

        toast({
          title: "Entidade criada",
          description: `A entidade "${entityName}" foi criada com sucesso.`,
        })

        // Atualizar lista após criar
        setEntities((prev) => [
          ...prev,
          {
            id: entityName.toLowerCase().replace(/\s+/g, "_"),
            name: entityName,
            createdAt: new Date().toISOString(),
          },
        ])
      } catch (error) {
        console.error("Erro ao cadastrar entidade:", error)
        toast({
          title: "Erro",
          description: "Erro ao se conectar com o servidor.",
          variant: "destructive",
        })
        return
      }
    }

    // Sempre ao final
    setIsDialogOpen(false)
    resetForm()
  }

  useEffect(() => {
    const carregarEntidades = async () => {
      try {
        const response = await fetch("/api/entidades")
        const data = await response.json()

        if (response.ok && data.success) {
          setEntities(data.entidades)
        } else {
          toast({
            title: "Erro",
            description: data.message || "Não foi possível carregar as entidades.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Erro ao carregar entidades:", error)
        toast({
          title: "Erro",
          description: "Erro de conexão ao buscar entidades.",
          variant: "destructive",
        })
      }
    }

    carregarEntidades()
  }, [])


  const handleDeleteEntity = async () => {
    if (!selectedEntity) return

    try {
      const response = await fetch(`/api/entidades/${selectedEntity.id}`, {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast({
          title: "Erro ao excluir",
          description: data.message || "Erro ao excluir a entidade.",
          variant: "destructive",
        })
        return
      }

      setEntities((prev) => prev.filter((entity) => entity.id !== selectedEntity.id))

      toast({
        title: "Entidade excluída",
        description: `A entidade "${selectedEntity.name}" foi excluída com sucesso.`,
      })
    } catch (error) {
      console.error("Erro ao excluir entidade:", error)
      toast({
        title: "Erro",
        description: "Erro ao se conectar com o servidor.",
        variant: "destructive",
      })
    }

    setIsDeleteDialogOpen(false)
    setSelectedEntity(null)
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
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Gerenciamento de Entidades</h3>
        <Button onClick={() => handleOpenDialog()} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Nova Entidade
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  Nenhuma entidade cadastrada. Clique em "Nova Entidade" para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              entities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell>{formatDate(entity.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(entity)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteDialog(entity)}
                        className="text-destructive"
                        title="Excluir"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo para criar/editar entidade */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedEntity ? "Editar Entidade" : "Nova Entidade"}</DialogTitle>
            <DialogDescription>
              {selectedEntity
                ? "Edite as informações da entidade abaixo."
                : "Preencha as informações para criar uma nova entidade."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={entityName}
                onChange={(e) => setEntityName(e.target.value)}
                placeholder="Digite o nome da entidade"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{selectedEntity ? "Salvar alterações" : "Criar entidade"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir entidade */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir entidade"
        description={`Tem certeza que deseja excluir a entidade "${selectedEntity?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteEntity}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
