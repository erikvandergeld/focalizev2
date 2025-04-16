import { DashboardHeader } from "@/components/dashboard-header"
import { TaskForm } from "@/components/task-form"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"  // Importando ProtectedRoute
import Link from "next/link"

export default function NewTaskPage() {
  return (
    <ProtectedRoute>
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Nova Tarefa" text="Crie uma nova tarefa para seu projeto.">
        <Link href="/dashboard/tasks">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
        </Link>
      </DashboardHeader>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Detalhes da Tarefa</CardTitle>
          <CardDescription>Preencha os campos abaixo para criar uma nova tarefa.</CardDescription>
        </CardHeader>
        <CardContent>
          <TaskForm />
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  )
}
