import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectForm } from "@/components/project-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"  // Importando ProtectedRoute
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function NewProjectPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 w-full">
        <DashboardHeader heading="Novo Projeto" text="Crie um novo projeto para gerenciar tarefas relacionadas.">
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
        </DashboardHeader>
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Detalhes do Projeto</CardTitle>
            <CardDescription>Preencha os campos abaixo para criar um novo projeto.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProjectForm />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
