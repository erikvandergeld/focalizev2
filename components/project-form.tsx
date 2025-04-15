"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEntities } from "@/hooks/use-entities"
import { Badge } from "@/components/ui/badge"
import { X, Plus } from "lucide-react"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import type { Project, Entity } from "@/types"

interface ProjectFormProps {
  project?: Project
  onSubmit: (projectData: Partial<Project>) => Promise<void>
  onCancel: () => void
  isSubmitting: boolean
}

export function ProjectForm({ project, onSubmit, onCancel, isSubmitting }: ProjectFormProps) {
  const [name, setName] = useState(project?.name || "")
  const [description, setDescription] = useState(project?.description || "")
  const [status, setStatus] = useState(project?.status || "active")
  const [startDate, setStartDate] = useState<Date | undefined>(
    project?.start_date ? new Date(project.start_date) : undefined,
  )
  const [endDate, setEndDate] = useState<Date | undefined>(project?.end_date ? new Date(project.end_date) : undefined)
  const [selectedEntities, setSelectedEntities] = useState<Entity[]>(project?.entities || [])
  const [entityPopoverOpen, setEntityPopoverOpen] = useState(false)

  const { entities, isLoading: isLoadingEntities } = useEntities()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const projectData: Partial<Project> = {
      name,
      description,
      status,
      start_date: startDate ? format(startDate, "yyyy-MM-dd") : undefined,
      end_date: endDate ? format(endDate, "yyyy-MM-dd") : undefined,
      entities: selectedEntities,
    }

    await onSubmit(projectData)
  }

  const handleSelectEntity = (entity: Entity) => {
    // Verificar se a entidade já está selecionada
    const isSelected = selectedEntities.some((e) => e.id === entity.id)

    if (!isSelected) {
      setSelectedEntities([...selectedEntities, entity])
    }

    setEntityPopoverOpen(false)
  }

  const handleRemoveEntity = (entityId: number | string) => {
    setSelectedEntities(selectedEntities.filter((entity) => entity.id !== entityId))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Nome do Projeto</Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Digite o nome do projeto"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Digite uma descrição para o projeto"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger id="status">
            <SelectValue placeholder="Selecione o status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="planning">Planejamento</SelectItem>
            <SelectItem value="active">Ativo</SelectItem>
            <SelectItem value="on_hold">Em Espera</SelectItem>
            <SelectItem value="completed">Concluído</SelectItem>
            <SelectItem value="canceled">Cancelado</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="start-date">Data de Início</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="start-date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !startDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {startDate ? format(startDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar mode="single" selected={startDate} onSelect={setStartDate} initialFocus locale={ptBR} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-date">Data de Término</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="end-date"
                variant="outline"
                className={cn("w-full justify-start text-left font-normal", !endDate && "text-muted-foreground")}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {endDate ? format(endDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={setEndDate}
                initialFocus
                locale={ptBR}
                disabled={(date) => (startDate ? date < startDate : false)}
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Entidades Relacionadas</Label>
        <div className="flex flex-wrap gap-1 mb-2">
          {selectedEntities.map((entity) => (
            <Badge key={entity.id} variant="secondary" className="flex items-center gap-1 px-2 py-1">
              {entity.name}
              <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemoveEntity(entity.id)} />
            </Badge>
          ))}
        </div>

        <Popover open={entityPopoverOpen} onOpenChange={setEntityPopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="h-8 gap-1">
              <Plus className="h-3.5 w-3.5" />
              Adicionar Entidade
            </Button>
          </PopoverTrigger>
          <PopoverContent className="p-0" align="start">
            <Command>
              <CommandInput placeholder="Buscar entidade..." />
              <CommandList>
                <CommandEmpty>Nenhuma entidade encontrada.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-auto">
                  {isLoadingEntities ? (
                    <div className="py-6 text-center text-sm">Carregando entidades...</div>
                  ) : (
                    entities
                      .filter((entity) => !selectedEntities.some((e) => e.id === entity.id))
                      .map((entity) => (
                        <CommandItem key={entity.id} value={entity.name} onSelect={() => handleSelectEntity(entity)}>
                          {entity.name}
                        </CommandItem>
                      ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Salvando..." : project ? "Atualizar Projeto" : "Criar Projeto"}
        </Button>
      </div>
    </form>
  )
}
