import { ClientForm } from "@/components/client-form"
import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewClientPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Novo Cliente" text="Cadastre um novo cliente para associar às tarefas.">
        <Link href="/dashboard/clients">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detalhes do Cliente</CardTitle>
          <CardDescription>Preencha os campos abaixo para cadastrar um novo cliente.</CardDescription>
        </CardHeader>
        <CardContent>
          <ClientForm />
        </CardContent>
      </Card>
    </div>
  )
}
