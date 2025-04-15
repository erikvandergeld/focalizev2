import { DashboardHeader } from "@/components/dashboard-header"
import { KanbanBoard } from "@/components/kanban-board"
import { TaskListView } from "@/components/task-list-view"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Dashboard" text="Gerencie suas tarefas e acompanhe o progresso dos seus projetos.">
        <Link href="/dashboard/tasks/new">
          <Button size="sm" className="gap-1">
            <Plus className="h-4 w-4" />
            Nova Tarefa
          </Button>
        </Link>
      </DashboardHeader>
      <Tabs defaultValue="kanban" className="w-full">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 w-full">
          <TabsList>
            <TabsTrigger value="kanban">Kanban</TabsTrigger>
            <TabsTrigger value="list">Lista</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="kanban" className="mt-4 w-full">
          <KanbanBoard />
        </TabsContent>
        <TabsContent value="list" className="mt-4 w-full">
          <TaskListView />
        </TabsContent>
      </Tabs>
    </div>
  )
}
