import { ClientList } from "@/components/client-list"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ClientsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Clientes" text="Gerencie seus clientes e visualize suas tarefas associadas.">
        <Link href="/dashboard/clients/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Novo Cliente
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Todos os clientes</CardTitle>
        </CardHeader>
        <CardContent>
          <ClientList />
        </CardContent>
      </Card>
    </div>
  )
}
