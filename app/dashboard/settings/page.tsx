import { DashboardHeader } from "@/components/dashboard-header"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { UserManagement } from "@/components/user-management"
import { EntityManagement } from "@/components/entity-management"

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 w-full">
      <DashboardHeader heading="Configurações" text="Gerencie as configurações do sistema, usuários e permissões." />

      <Tabs defaultValue="users" className="w-full">
        <TabsList>
          <TabsTrigger value="users">Usuários</TabsTrigger>
          <TabsTrigger value="entities">Entidades</TabsTrigger>
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4 w-full">
          <Card className="w-full">
            <UserManagement />
          </Card>
        </TabsContent>

        <TabsContent value="entities" className="mt-4 w-full">
          <Card className="w-full">
            <EntityManagement />
          </Card>
        </TabsContent>

        <TabsContent value="general" className="mt-4 w-full">
          <Card className="p-6 w-full">
            <h3 className="text-lg font-medium mb-4">Configurações Gerais</h3>
            <p className="text-sm text-muted-foreground">Configurações gerais do sistema em desenvolvimento.</p>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="mt-4 w-full">
          <Card className="p-6 w-full">
            <h3 className="text-lg font-medium mb-4">Configurações de Notificações</h3>
            <p className="text-sm text-muted-foreground">Configurações de notificações em desenvolvimento.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
