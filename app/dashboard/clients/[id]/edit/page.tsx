import { ClientForm } from "@/components/client-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface EditClientPageProps {
  params: {
    id: string
  }
}

export default function EditClientPage({ params }: EditClientPageProps) {
  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Editar Cliente" text="Atualize as informações do cliente.">
        <Link href={`/dashboard/clients/${params.id}`}>
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detalhes do Cliente</CardTitle>
          <CardDescription>Atualize os campos abaixo para editar as informações do cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm clientId={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}
