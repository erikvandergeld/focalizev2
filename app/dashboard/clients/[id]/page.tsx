import { ClientDetails } from "@/components/client-details"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"

interface ClientPageProps {
  params: {
    id: string
  }
}

export default function ClientPage({ params }: ClientPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader heading="Detalhes do Cliente" text="Visualize informações e tarefas associadas ao cliente.">
        <div className="flex gap-2">
          <Link href="/dashboard/clients">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Link href={`/dashboard/clients/${params.id}/edit`}>
            <Button size="sm" className="gap-1">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </DashboardHeader>
      <Card>
        <CardContent className="pt-6">
          <ClientDetails id={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}
