import { DashboardHeader } from "@/components/dashboard-header"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"
import { ProjectDetails } from "@/components/project-details"

interface ProjectPageProps {
  params: {
    id: string
  }
}

export default function ProjectPage({ params }: ProjectPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader heading="Detalhes do Projeto" text="Visualize informações e tarefas associadas ao projeto.">
        <div className="flex gap-2">
          <Link href="/dashboard/projects">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Button>
          </Link>
          <Link href={`/dashboard/projects/${params.id}/edit`}>
            <Button size="sm" className="gap-1">
              <Pencil className="h-4 w-4" />
              Editar
            </Button>
          </Link>
        </div>
      </DashboardHeader>
      <Card>
        <CardContent className="pt-6">
          <ProjectDetails id={params.id} />
        </CardContent>
      </Card>
    </div>
  )
}
