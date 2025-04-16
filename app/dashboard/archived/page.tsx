import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ArchivedTaskList } from "@/components/archived-task-list"
import { ProtectedRoute } from "@/components/protected-route"  // Importando ProtectedRoute

export default function ArchivedTasksPage() {
  return (
    <ProtectedRoute>
      <div className="flex flex-col gap-6 w-full">
        <DashboardHeader heading="Tarefas Arquivadas" text="Visualize o histórico de tarefas finalizadas e arquivadas." />

        <Card className="w-full">
          <CardHeader>
            <CardTitle>Histórico de Tarefas</CardTitle>
          </CardHeader>
          <CardContent>
            <ArchivedTaskList />
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
}
