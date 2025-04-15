"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Plus, Tag } from "lucide-react"
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
type TagType = {
  id: string
  name: string
  color: string
  createdAt: string
}

// Dados iniciais vazios
const initialTags: TagType[] = []

export function TagManagement() {
  const [tags, setTags] = useState<TagType[]>(initialTags)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedTag, setSelectedTag] = useState<TagType | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    color: "#3B82F6", // Cor padrão azul
  })
  const { toast } = useToast()

  // Movido para useEffect para evitar acesso ao DOM durante SSR
  useEffect(() => {
    const newTagButton = document.getElementById("new-tag-button")
    if (newTagButton) {
      const handleClick = () => handleOpenDialog()
      newTagButton.addEventListener("click", handleClick)
      return () => {
        newTagButton.removeEventListener("click", handleClick)
      }
    }
  }, []) // Dependências vazias para executar apenas uma vez na montagem

  const resetForm = () => {
    setFormData({
      name: "",
      color: "#3B82F6",
    })
    setSelectedTag(null)
  }

  const handleOpenDialog = (tag?: TagType) => {
    if (tag) {
      setSelectedTag(tag)
      setFormData({
        name: tag.name,
        color: tag.color,
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (tag: TagType) => {
    setSelectedTag(tag)
    setIsDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, color: e.target.value }))
  }

  const handleSubmit = () => {
    // Validação
    if (!formData.name) {
      toast({
        title: "Erro de validação",
        description: "O nome da tag é obrigatório.",
        variant: "destructive",
      })
      return
    }

    if (!formData.color) {
      toast({
        title: "Erro de validação",
        description: "Selecione uma cor para a tag.",
        variant: "destructive",
      })
      return
    }

    if (selectedTag) {
      // Atualizar tag existente
      setTags((prev) =>
        prev.map((tag) =>
          tag.id === selectedTag.id
            ? {
                ...tag,
                name: formData.name,
                color: formData.color,
              }
            : tag,
        ),
      )

      toast({
        title: "Tag atualizada",
        description: `A tag "${formData.name}" foi atualizada com sucesso.`,
      })
    } else {
      // Criar nova tag
      const newTag: TagType = {
        id: `tag-${Date.now()}`,
        name: formData.name,
        color: formData.color,
        createdAt: new Date().toISOString(),
      }

      setTags((prev) => [...prev, newTag])

      toast({
        title: "Tag criada",
        description: `A tag "${formData.name}" foi criada com sucesso.`,
      })
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDeleteTag = () => {
    if (!selectedTag) return

    setTags((prev) => prev.filter((tag) => tag.id !== selectedTag.id))

    toast({
      title: "Tag excluída",
      description: `A tag "${selectedTag.name}" foi excluída com sucesso.`,
    })

    setIsDeleteDialogOpen(false)
    setSelectedTag(null)
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
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Gerenciamento de Tags</h3>
        <Button onClick={() => handleOpenDialog()} className="gap-1">
          <Plus className="h-4 w-4" />
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
            {tags.map((tag) => (
              <TableRow key={tag.id}>
                <TableCell className="font-medium">{tag.name}</TableCell>
                <TableCell>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit"
                    style={{
                      backgroundColor: tag.color,
                      color: "white",
                    }}
                  >
                    <Tag className="h-3 w-3" />
                    {tag.name}
                  </span>
                </TableCell>
                <TableCell>{formatDate(tag.createdAt)}</TableCell>
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
            ))}
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
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="color">Cor</Label>
              <div className="flex gap-3 items-center">
                <Input
                  id="color"
                  name="color"
                  type="color"
                  value={formData.color}
                  onChange={handleColorChange}
                  className="w-12 h-8 p-1 cursor-pointer"
                />
                <Input
                  id="colorHex"
                  name="colorHex"
                  value={formData.color}
                  onChange={handleColorChange}
                  className="font-mono"
                  maxLength={7}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Visualização</Label>
              <span
                className="px-2 py-0.5 rounded-full text-xs font-medium flex items-center gap-1.5 w-fit"
                style={{
                  backgroundColor: formData.color,
                  color: "white",
                }}
              >
                <Tag className="h-3 w-3" />
                {formData.name || "Nome da tag"}
              </span>
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
