import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectForm } from "@/components/project-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"  // Importando ProtectedRoute
import Link from "next/link"

interface EditProjectPageProps {
  params: {
    id: string
  }
}

export default function EditProjectPage({ params }: EditProjectPageProps) {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 w-full">
        <DashboardHeader heading="Editar Projeto" text="Atualize as informações do projeto.">
          <Link href={`/dashboard/projects/${params.id}`}>
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </DashboardHeader>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Detalhes do Projeto</CardTitle>
            <CardDescription>Atualize os campos abaixo para editar as informações do projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm projectId={params.id} />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
