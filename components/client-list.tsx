"use client"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, Eye } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useState } from "react"
import { ConfirmDialog } from "./confirm-dialog"
import { useNotifications } from "./notification-provider"
import { useToast } from "@/components/ui/use-toast"
import { useEffect } from "react"

// ...



// Dados de exemplo
const initialClients: any[] = []

export function ClientList() {
  const router = useRouter()
  const { toast } = useToast()
  const { addNotification } = useNotifications()
  const [clients, setClients] = useState(initialClients)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedClient, setSelectedClient] = useState<any | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date)
  }
  
  useEffect(() => {
    const carregarClientes = async () => {
      try {
        const response = await fetch("/api/clientes")
        const data = await response.json()
  
        if (response.ok && data.success && Array.isArray(data.clientes)) {
          setClients(data.clientes)
        } else {
          setClients([]) // ✅ evita undefined
        }
      } catch (error) {
        console.error("Erro ao carregar clientes:", error)
        setClients([]) // ✅ fallback seguro
      }
    }
  
    carregarClientes()
  }, [toast])
  

  const handleView = (id: string) => {
    router.push(`/dashboard/clients/${id}`)
  }

  const handleEdit = (id: string) => {
    router.push(`/dashboard/clients/${id}/edit`)
  }

  const handleOpenDeleteDialog = (client: any) => {
    setSelectedClient(client)
    setDeleteDialogOpen(true)
  }

  const handleDeleteClient = async () => {
    if (!selectedClient) return

    try {
      const response = await fetch(`/api/clientes/${selectedClient.id}`, {
        method: "DELETE",
      })
      const data = await response.json()

      if (!response.ok || !data.success) {
        toast({
          title: "Erro",
          description: data.message || "Erro ao excluir cliente.",
          variant: "destructive",
        })
        return
      }

      toast({
        title: "Cliente excluído",
        description: `O cliente "${selectedClient.name}" foi excluído com sucesso.`,
      })

      addNotification("Cliente excluído", `O cliente "${selectedClient.name}" foi excluído do sistema.`)

      // Atualizar lista local
      setClients((prev) => prev.filter((client) => client.id !== selectedClient.id))
      setDeleteDialogOpen(false)
      setSelectedClient(null)

    } catch (error) {
      console.error("Erro ao excluir cliente:", error)
      toast({
        title: "Erro",
        description: "Erro ao se conectar com o servidor.",
        variant: "destructive",
      })
    }
  }


  return (
    <>
      <div className="rounded-md border w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Empresa</TableHead>
              <TableHead>Data de cadastro</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id}>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.email}</TableCell>
                <TableCell>{client.phone}</TableCell>
                <TableCell>{client.company}</TableCell>
                <TableCell>{formatDate(client.createdAt)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        Ações
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleView(client.id)}>
                        <Eye className="h-4 w-4" />
                        <span>Visualizar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="flex items-center gap-2" onClick={() => handleEdit(client.id)}>
                        <Pencil className="h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="flex items-center gap-2 text-destructive"
                        onClick={() => handleOpenDeleteDialog(client)}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>Excluir</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Diálogo de confirmação para excluir cliente */}
      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Excluir cliente"
        description={`Tem certeza que deseja excluir o cliente "${selectedClient?.name}"? Esta ação não pode ser desfeita.`}
        onConfirm={handleDeleteClient}
        confirmText="Sim, excluir"
        cancelText="Cancelar"
      />
    </>
  )
}
