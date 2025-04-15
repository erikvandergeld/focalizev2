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
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "./confirm-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useTags } from "@/hooks/use-tags"
import type { Tag } from "@/types"

export function TagManagement() {
  const { tags, isLoading, addTag, editTag, removeTag } = useTags()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null)
  const [tagName, setTagName] = useState("")
  const [tagColor, setTagColor] = useState("#3498db")
  const { toast } = useToast()

  const resetForm = () => {
    setTagName("")
    setTagColor("#3498db")
    setSelectedTag(null)
  }

  const handleOpenDialog = (tag?: Tag) => {
    if (tag) {
      setSelectedTag(tag)
      setTagName(tag.name)
      setTagColor(tag.color)
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (tag: Tag) => {
    setSelectedTag(tag)
    setIsDeleteDialogOpen(true)
  }

  const handleSubmit = async () => {
    // Validação
    if (!tagName.trim()) {
      toast({
        title: "Erro de validação",
        description: "O nome da tag é obrigatório.",
        variant: "destructive",
      })
      return
    }

    try {
      if (selectedTag) {
        // Atualizar tag existente
        await editTag(selectedTag.id, {
          name: tagName,
          color: tagColor,
        })
      } else {
        // Criar nova tag
        await addTag({
          name: tagName,
          color: tagColor,
        })
      }

      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Erro ao salvar tag:", error)
    }
  }

  const handleDeleteTag = async () => {
    if (!selectedTag) return

    try {
      await removeTag(selectedTag.id)
      setIsDeleteDialogOpen(false)
      setSelectedTag(null)
    } catch (error) {
      console.error("Erro ao excluir tag:", error)
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
        <h3 className="text-lg font-medium">Gerenciamento de Tags</h3>
        <Button onClick={() => handleOpenDialog()} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Nova Tag
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Cor</TableHead>
              <TableHead>Data de Criação</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tags.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Nenhuma tag cadastrada. Clique em "Nova Tag" para adicionar.
                </TableCell>
              </TableRow>
            ) : (
              tags.map((tag) => (
                <TableRow key={tag.id}>
                  <TableCell className="font-medium">{tag.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: tag.color }} />
                      {tag.color}
                    </div>
                  </TableCell>
                  <TableCell>{formatDate(tag.created_at)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(tag)} title="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenDeleteDialog(tag)}
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

      {/* Diálogo para criar/editar tag */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{selectedTag ? "Editar Tag" : "Nova Tag"}</DialogTitle>
            <DialogDescription>
              {selectedTag ? "Edite as informações da tag abaixo." : "Preencha as informações para criar uma nova tag."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Nome</Label>
              <Input
                id="name"
                value={tagName}
                onChange={(e) => setTagName(e.target.value)}
                placeholder="Digite o nome da tag"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="color"
                  type="color"
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  className="w-12 h-10 p-1"
                />
                <Input
                  value={tagColor}
                  onChange={(e) => setTagColor(e.target.value)}
                  placeholder="#000000"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{selectedTag ? "Salvar alterações" : "Criar tag"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir tag */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir tag"
        description={`Tem certeza que deseja excluir a tag "${selectedTag?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteTag}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
