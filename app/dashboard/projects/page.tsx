import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectList } from "@/components/project-list"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"  // Importando ProtectedRoute
import { Plus } from "lucide-react"
import Link from "next/link"

export default function ProjectsPage() {
  return (
    <ProtectedRoute>
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Projetos" text="Gerencie seus projetos e visualize as tarefas associadas.">
        <Link href="/dashboard/projects/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Novo Projeto
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Todos os projetos</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectList />
        </CardContent>
      </Card>
    </div>
  </ProtectedRoute>
  )
}
