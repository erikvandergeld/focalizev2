"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Filter, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface TaskFiltersProps {
  onFilterChange: (filters: any) => void
  availableProjects: { id: string; name: string }[]
  availableClients: { id: string; name: string }[]
  availableUsers: { id: string; full_name: string }[]
  availableEntities: { id: string; name: string }[]
}

export function TaskFilters({
  onFilterChange,
  availableProjects = [],
  availableClients = [],
  availableUsers = [],
  availableEntities = [],
}: TaskFiltersProps) {
  const [taskTypes] = useState([
    { id: "administrative", name: "Administrativo" },
    { id: "technical", name: "Técnico" },
  ])

  const [search, setSearch] = useState("")
  const [activeFilters, setActiveFilters] = useState<{
    clients: string[]
    users: string[]
    entities: string[]
    taskTypes: string[]
    projects: string[]
  }>({
    clients: [],
    users: [],
    entities: [],
    taskTypes: [],
    projects: [],
  })

  // Função de toggle para adicionar ou remover filtros
  const toggleFilter = useCallback((category: keyof typeof activeFilters, id: string) => {
    setActiveFilters((prev) => {
      const newFilters = { ...prev }
      if (newFilters[category].includes(id)) {
        // Remover filtro
        newFilters[category] = newFilters[category].filter((item) => item !== id)
      } else {
        // Adicionar filtro
        newFilters[category] = [...newFilters[category], id]
      }
      return newFilters
    })
  }, [])

  // Limpar filtros
  const clearFilters = useCallback(() => {
    setActiveFilters({
      clients: [],
      users: [],
      entities: [],
      taskTypes: [],
      projects: [],
    })
    setSearch("")
  }, [])

  // Atualizando os filtros sempre que o estado de search ou filtros for alterado
  useEffect(() => {
    const timer = setTimeout(() => {
      onFilterChange({
        search,
        ...activeFilters,
      })
    }, 300)
    return () => clearTimeout(timer)
  }, [search, activeFilters, onFilterChange])

  const totalActiveFilters = Object.values(activeFilters).reduce((sum, filters) => sum + filters.length, 0)

  return (
    <div className="flex flex-col w-full max-w-full">
      <div className="flex items-center gap-2 w-full">
        <div className="relative flex-grow">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar tarefas..."
            className="w-full pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setSearch("")}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Limpar</span>
            </Button>
          )}
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1 whitespace-nowrap">
              <Filter className="h-4 w-4" />
              Filtros
              {totalActiveFilters > 0 && (
                <Badge variant="secondary" className="ml-1 h-5 w-5 rounded-full p-0 text-xs">
                  {totalActiveFilters}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[240px]">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Filtros</span>
              {totalActiveFilters > 0 && (
                <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearFilters}>
                  Limpar todos
                </Button>
              )}
            </DropdownMenuLabel>

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Entidades</DropdownMenuLabel>
            {availableEntities.length === 0 ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">Nenhuma entidade disponível</div>
            ) : (
              availableEntities.map((entity) => (
                <DropdownMenuCheckboxItem
                  key={entity.id}
                  checked={activeFilters.entities.includes(entity.id)}
                  onCheckedChange={() => toggleFilter("entities", entity.id)}
                >
                  {entity.name}
                </DropdownMenuCheckboxItem>
              ))
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Tipo de Tarefa</DropdownMenuLabel>
            {taskTypes.map((type) => (
              <DropdownMenuCheckboxItem
                key={type.id}
                checked={activeFilters.taskTypes.includes(type.id)}
                onCheckedChange={() => toggleFilter("taskTypes", type.id)}
              >
                {type.name}
              </DropdownMenuCheckboxItem>
            ))}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Projetos</DropdownMenuLabel>
            {availableProjects.length === 0 ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">Nenhum projeto disponível</div>
            ) : (
              availableProjects.map((project) => (
                <DropdownMenuCheckboxItem
                  key={project.id}
                  checked={activeFilters.projects.includes(project.id)}
                  onCheckedChange={() => toggleFilter("projects", project.id)}
                >
                  {project.name}
                </DropdownMenuCheckboxItem>
              ))
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Clientes</DropdownMenuLabel>
            {availableClients.length === 0 ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">Nenhum cliente disponível</div>
            ) : (
              availableClients.map((client) => (
                <DropdownMenuCheckboxItem
                  key={client.id}
                  checked={activeFilters.clients.includes(client.id)}
                  onCheckedChange={() => toggleFilter("clients", client.id)}
                >
                  {client.name}
                </DropdownMenuCheckboxItem>
              ))
            )}

            <DropdownMenuSeparator />
            <DropdownMenuLabel>Responsáveis</DropdownMenuLabel>
            {availableUsers.length === 0 ? (
              <div className="px-2 py-2 text-sm text-muted-foreground">Nenhum usuário disponível</div>
            ) : (
              availableUsers.map((user) => (
                <DropdownMenuCheckboxItem
                  key={user.id}
                  checked={activeFilters.users.includes(user.id)}
                  onCheckedChange={() => toggleFilter("users", user.id)}
                >
                  {user.full_name}
                </DropdownMenuCheckboxItem>
              ))
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Exibir badges para filtros ativos */}
      {totalActiveFilters > 0 && (
        <div className="flex flex-wrap gap-1 mt-2 w-full">
          {activeFilters.entities.map((id) => {
            const entity = availableEntities.find((e) => e.id === id)
            return entity ? (
              <Badge key={`entity-${id}`} variant="outline" className="flex items-center gap-1">
                {entity.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleFilter("entities", id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
          {activeFilters.taskTypes.map((id) => {
            const type = taskTypes.find((t) => t.id === id)
            return type ? (
              <Badge key={`type-${id}`} variant="outline" className="flex items-center gap-1">
                {type.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleFilter("taskTypes", id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
          {activeFilters.projects.map((id) => {
            const project = availableProjects.find((p) => p.id === id)
            return project ? (
              <Badge key={`project-${id}`} variant="outline" className="flex items-center gap-1">
                {project.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleFilter("projects", id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
          {activeFilters.clients.map((id) => {
            const client = availableClients.find((c) => c.id === id)
            return client ? (
              <Badge key={`client-${id}`} variant="outline" className="flex items-center gap-1">
                {client.name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleFilter("clients", id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
          {activeFilters.users.map((id) => {
            const user = availableUsers.find((u) => u.id === id)
            return user ? (
              <Badge key={`user-${id}`} variant="outline" className="flex items-center gap-1">
                {user.full_name}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => toggleFilter("users", id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}
