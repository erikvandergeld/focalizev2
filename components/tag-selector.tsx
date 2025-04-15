"use client"

import { useState } from "react"
import { Check, X, Plus } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { useTags } from "@/hooks/use-tags"
import type { Tag } from "@/types"

interface TagSelectorProps {
  selectedTags: Tag[]
  onChange: (tags: Tag[]) => void
  maxTags?: number
}

export function TagSelector({ selectedTags, onChange, maxTags = 5 }: TagSelectorProps) {
  const { tags, isLoading } = useTags()
  const [open, setOpen] = useState(false)

  const handleSelect = (tag: Tag) => {
    // Verificar se a tag já está selecionada
    const isSelected = selectedTags.some((t) => t.id === tag.id)

    if (isSelected) {
      // Remover a tag
      onChange(selectedTags.filter((t) => t.id !== tag.id))
    } else {
      // Adicionar a tag se não exceder o limite
      if (selectedTags.length < maxTags) {
        onChange([...selectedTags, tag])
      }
    }
  }

  const handleRemove = (tagId: number | string) => {
    onChange(selectedTags.filter((tag) => tag.id !== tagId))
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {selectedTags.map((tag) => (
          <Badge
            key={tag.id}
            style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }}
            className="flex items-center gap-1 px-2 py-1"
          >
            {tag.name}
            <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemove(tag.id)} />
          </Badge>
        ))}

        {selectedTags.length < maxTags && (
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1">
                <Plus className="h-3.5 w-3.5" />
                Adicionar Tag
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-0" align="start">
              <Command>
                <CommandInput placeholder="Buscar tag..." />
                <CommandList>
                  <CommandEmpty>Nenhuma tag encontrada.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {isLoading ? (
                      <div className="py-6 text-center text-sm">Carregando tags...</div>
                    ) : (
                      tags.map((tag) => {
                        const isSelected = selectedTags.some((t) => t.id === tag.id)
                        return (
                          <CommandItem
                            key={tag.id}
                            value={tag.name}
                            onSelect={() => handleSelect(tag)}
                            className="flex items-center gap-2"
                          >
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: tag.color }} />
                            <span>{tag.name}</span>
                            {isSelected && <Check className="ml-auto h-4 w-4" />}
                          </CommandItem>
                        )
                      })
                    )}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        )}
      </div>

      {selectedTags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">Limite máximo de {maxTags} tags atingido.</p>
      )}
    </div>
  )
}

// Função para determinar se o texto deve ser branco ou preto com base na cor de fundo
function getContrastColor(hexColor: string): string {
  // Remover o # se existir
  const color = hexColor.replace("#", "")

  // Converter para RGB
  const r = Number.parseInt(color.substr(0, 2), 16)
  const g = Number.parseInt(color.substr(2, 2), 16)
  const b = Number.parseInt(color.substr(4, 2), 16)

  // Calcular a luminância
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  // Retornar branco ou preto com base na luminância
  return luminance > 0.5 ? "#000000" : "#ffffff"
}
