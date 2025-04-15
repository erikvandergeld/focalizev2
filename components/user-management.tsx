"use client"

import type React from "react"

import { useState, useCallback, useEffect } from "react"
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
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { ConfirmDialog } from "./confirm-dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"

// Tipos
type Permission = {
  id: string
  name: string
  description: string
}

type User = {
  id: string
  firstName: string
  lastName: string
  email: string
  entities: string[]
  permissions: string[]
  createdAt: string
}

// Dados de exemplo
const entities = [
  { id: "ingline", name: "Ingline Systems" },
  { id: "line_movel", name: "Line Movel" },
  { id: "macrophony", name: "Macrophony" },
  { id: "voicenet", name: "Voicenet" },
  { id: "connyctel", name: "Connyctel" },
]

const permissions: Permission[] = [
  { id: "create_task", name: "Criar Tarefas", description: "Permite criar novas tarefas" },
  { id: "edit_task", name: "Editar Tarefas", description: "Permite editar tarefas existentes" },
  { id: "delete_task", name: "Excluir Tarefas", description: "Permite excluir tarefas" },
  { id: "view_task", name: "Visualizar Tarefas", description: "Permite visualizar tarefas" },
  { id: "archive_task", name: "Arquivar Tarefas", description: "Permite arquivar tarefas finalizadas" },
  {
    id: "update_task_status",
    name: "Atualizar Status de Tarefas",
    description: "Permite atualizar o status das tarefas",
  },
  { id: "manage_users", name: "Gerenciar Usuários", description: "Permite gerenciar usuários do sistema" },
  { id: "manage_clients", name: "Gerenciar Clientes", description: "Permite gerenciar clientes" },
]

export function UserManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    entities: [] as string[],
    permissions: [] as string[],
  })
  const { toast } = useToast()
  // Inicialize com um valor padrão e atualize após a montagem do componente
  const [isAdminDisabled, setIsAdminDisabled] = useState(false)

  // Carregue o valor do localStorage apenas no lado do cliente
  useEffect(() => {
    // Verificar se estamos no navegador antes de acessar localStorage
    if (typeof window !== "undefined") {
      setIsAdminDisabled(localStorage.getItem("adminDisabled") === "true")
    }
  }, [])

  const resetForm = () => {
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      entities: [],
      permissions: [],
    })
    setSelectedUser(null)
  }

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user)
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
        confirmPassword: "",
        entities: [...user.entities],
        permissions: [...user.permissions],
      })
    } else {
      resetForm()
    }
    setIsDialogOpen(true)
  }

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user)
    setIsDeleteDialogOpen(true)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const toggleEntity = (entityId: string) => {
    setFormData((prev) => ({
      ...prev,
      entities: prev.entities.includes(entityId)
        ? prev.entities.filter((id) => id !== entityId)
        : [...prev.entities, entityId],
    }))
  }

  const togglePermission = (permissionId: string) => {
    setFormData((prev) => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter((id) => id !== permissionId)
        : [...prev.permissions, permissionId],
    }))
  }

  const handleSubmit = () => {
    // Validação
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Erro de validação",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      })
      return
    }

    if (formData.entities.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma entidade.",
        variant: "destructive",
      })
      return
    }

    if (formData.permissions.length === 0) {
      toast({
        title: "Erro de validação",
        description: "Selecione pelo menos uma permissão.",
        variant: "destructive",
      })
      return
    }

    if (!selectedUser && (!formData.password || formData.password.length < 6)) {
      toast({
        title: "Erro de validação",
        description: "A senha deve ter pelo menos 6 caracteres.",
        variant: "destructive",
      })
      return
    }

    if (!selectedUser && formData.password !== formData.confirmPassword) {
      toast({
        title: "Erro de validação",
        description: "As senhas não coincidem.",
        variant: "destructive",
      })
      return
    }

    if (selectedUser) {
      // Atualizar usuário existente
      setUsers((prev) =>
        prev.map((user) =>
          user.id === selectedUser.id
            ? {
                ...user,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                entities: formData.entities,
                permissions: formData.permissions,
              }
            : user,
        ),
      )

      toast({
        title: "Usuário atualizado",
        description: `O usuário ${formData.firstName} ${formData.lastName} foi atualizado com sucesso.`,
      })
    } else {
      // Criar novo usuário
      const newUser: User = {
        id: `user-${Date.now()}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        entities: formData.entities,
        permissions: formData.permissions,
        createdAt: new Date().toISOString(),
      }

      setUsers((prev) => [...prev, newUser])

      toast({
        title: "Usuário criado",
        description: `O usuário ${formData.firstName} ${formData.lastName} foi criado com sucesso.`,
      })
    }

    setIsDialogOpen(false)
    resetForm()
  }

  const handleDeleteUser = () => {
    if (!selectedUser) return

    setUsers((prev) => prev.filter((user) => user.id !== selectedUser.id))

    toast({
      title: "Usuário excluído",
      description: `O usuário ${selectedUser.firstName} ${selectedUser.lastName} foi excluído com sucesso.`,
    })

    setIsDeleteDialogOpen(false)
    setSelectedUser(null)
  }

  const handleToggleAdminStatus = useCallback(() => {
    // Verificar se estamos no navegador antes de acessar localStorage
    if (typeof window === "undefined") return

    const newStatus = !isAdminDisabled
    setIsAdminDisabled(newStatus)
    localStorage.setItem("adminDisabled", newStatus.toString())

    toast({
      title: newStatus ? "Usuário admin desativado" : "Usuário admin ativado",
      description: newStatus
        ? "O usuário administrador padrão foi desativado."
        : "O usuário administrador padrão foi ativado.",
    })
  }, [isAdminDisabled, toast])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }

  const getEntityNames = (entityIds: string[]) => {
    return entityIds
      .map((id) => entities.find((entity) => entity.id === id)?.name)
      .filter(Boolean)
      .join(", ")
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-medium">Gerenciamento de Usuários</h3>
        <Button onClick={() => handleOpenDialog()} className="gap-1">
          <PlusCircle className="h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <div className="bg-muted p-4 rounded-md mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-medium">Usuário Administrador Padrão</h4>
            <p className="text-sm text-muted-foreground">
              Usuário: ADMIN | {isAdminDisabled ? "Desativado" : "Ativado"}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm">Desativar usuário admin</span>
            <Switch
              checked={isAdminDisabled}
              onCheckedChange={handleToggleAdminStatus}
              aria-label="Toggle admin user"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Entidades</TableHead>
              <TableHead>Permissões</TableHead>
              <TableHead>Data de Cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">
                  {user.firstName} {user.lastName}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.entities.map((entityId) => {
                      const entity = entities.find((e) => e.id === entityId)
                      return entity ? (
                        <Badge key={entityId} variant="outline" className="text-xs">
                          {entity.name}
                        </Badge>
                      ) : null
                    })}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {user.permissions.length > 2 ? (
                      <>
                        <Badge variant="secondary" className="text-xs">
                          {user.permissions.length} permissões
                        </Badge>
                      </>
                    ) : (
                      user.permissions.map((permId) => {
                        const perm = permissions.find((p) => p.id === permId)
                        return perm ? (
                          <Badge key={permId} variant="secondary" className="text-xs">
                            {perm.name}
                          </Badge>
                        ) : null
                      })
                    )}
                  </div>
                </TableCell>
                <TableCell>{formatDate(user.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(user)} title="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDeleteDialog(user)}
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

      {/* Diálogo para criar/editar usuário */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedUser ? "Editar Usuário" : "Novo Usuário"}</DialogTitle>
            <DialogDescription>
              {selectedUser
                ? "Edite as informações do usuário abaixo."
                : "Preencha as informações para criar um novo usuário."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="firstName">Nome</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="lastName">Sobrenome</Label>
                <Input id="lastName" name="lastName" value={formData.lastName} onChange={handleInputChange} required />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
              />
            </div>

            {!selectedUser && (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required={!selectedUser}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required={!selectedUser}
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label>Entidades</Label>
              <div className="border rounded-md p-4 grid grid-cols-2 gap-2">
                {entities.map((entity) => (
                  <div key={entity.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`entity-${entity.id}`}
                      checked={formData.entities.includes(entity.id)}
                      onCheckedChange={() => toggleEntity(entity.id)}
                    />
                    <Label htmlFor={`entity-${entity.id}`} className="text-sm font-normal cursor-pointer">
                      {entity.name}
                    </Label>
                  </div>
                ))}
              </div>
              {formData.entities.length === 0 && (
                <p className="text-sm text-destructive">Selecione pelo menos uma entidade</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Permissões</Label>
              <div className="border rounded-md p-4 grid grid-cols-2 gap-2">
                {permissions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`permission-${permission.id}`}
                      checked={formData.permissions.includes(permission.id)}
                      onCheckedChange={() => togglePermission(permission.id)}
                    />
                    <div>
                      <Label htmlFor={`permission-${permission.id}`} className="text-sm font-normal cursor-pointer">
                        {permission.name}
                      </Label>
                      <p className="text-xs text-muted-foreground">{permission.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              {formData.permissions.length === 0 && (
                <p className="text-sm text-destructive">Selecione pelo menos uma permissão</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSubmit}>{selectedUser ? "Salvar alterações" : "Criar usuário"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para excluir usuário */}
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Excluir usuário"
        description={`Tem certeza que deseja excluir o usuário ${selectedUser?.firstName} ${selectedUser?.lastName}? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteUser}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </div>
  )
}
