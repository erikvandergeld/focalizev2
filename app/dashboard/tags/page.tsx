"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { TagManagement } from "@/components/tag-management"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ProtectedRoute } from "@/components/protected-route"  // Importando ProtectedRoute
import { Plus } from "lucide-react"

export default function TagsPage() {
  return (
    <ProtectedRoute>
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Tags" text="Gerencie as tags para categorizar suas tarefas.">
        <Button size="sm" className="gap-1" id="new-tag-button">
          <Plus className="h-4 w-4" />
          Nova Tag
        </Button>
      </DashboardHeader>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Todas as tags</CardTitle>
        </CardHeader>
        <CardContent>
          <TagManagement />
        </CardContent>
      </Card>
    </div>
    </ProtectedRoute>
  )
}
