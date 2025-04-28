import { DashboardHeader } from "@/components/dashboard-header"
import { TaskFilters } from "@/components/task-filters"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus } from "lucide-react"
import { ProtectedRoute } from "@/components/protected-route"  // Importando ProtectedRoute
import Link from "next/link"
import { TaskListView } from "@/components/task-list-view"


export default function TasksPage() {
  return (
    <ProtectedRoute>
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Tarefas" text="Gerencie todas as suas tarefas.">
        <Link href="/dashboard/tasks/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </Link>
      </DashboardHeader>
      <div className="flex items-center justify-between w-full">
      </div>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Todas as tarefas</CardTitle>
        </CardHeader>
        <CardContent>
        <TaskListView />
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  )
}
