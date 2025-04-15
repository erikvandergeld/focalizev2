"use client"

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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "./confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useEntities } from "@/hooks/use-entities"
import type { Entity } from "@/types"

export function EntityManagement() {
  const { entities, isLoading, addEntity, editEntity, removeEntity } = useEntities()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedEntity, setSelectedEntity] = useState<Entity | null>(null)
  const [entityName, setEntityName] = useState("")
  const [entityDescription, setEntityDescription] = useState("")
  const { toast } = useToast()

  const resetForm = () => {
    setEntityName("")
    setEntityDescription("")
    setSelectedEntity(null)
  }

  const handleOpenDialog = (entity?: Entity) => {
    if (entity) {
      setSelectedEntity(entity)
      setEntityName(entity.name)
      setEntityDescription(entity.description || "")
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

    try {
      if (selectedEntity) {
        // Atualizar entidade existente
        await editEntity(selectedEntity.id, {
          name: entityName,
          description: entityDescription,
        })
      } else {
        // Criar nova entidade
        await addEntity({
          name: entityName,
          description: entityDescription,
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar entidade:", error)
    }
  }

  const handleDeleteEntity = async () => {
    if (!selectedEntity) return

    try {
      await removeEntity(selectedEntity.id)
      setIsDeleteDialogOpen(false)
      setSelectedEntity(null)
    } catch (error) {
      console.error("Erro ao excluir entidade:", error)
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

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    )
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
              <TableHead>Descrição</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma entidade cadastrada. Clique em "Nova Entidade" para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              entities.map((entity) => (
                <TableRow key={entity.id}>
                  <TableCell className="font-medium">{entity.name}</TableCell>
                  <TableCell>
                    {entity.description
                      ? entity.description.substring(0, 50) + (entity.description.length > 50 ? "..." : "")
                      : "-"}
                  </TableCell>
                  <TableCell>{formatDate(entity.created_at)}</TableCell>
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
            <div className="grid gap-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={entityDescription}
                onChange={(e) => setEntityDescription(e.target.value)}
                placeholder="Digite uma descrição (opcional)"
                rows={3}
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
