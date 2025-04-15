import type React from "react"
import { DashboardNav } from "@/components/dashboard-nav"
import { UserNav } from "@/components/user-nav"
import { ModeToggle } from "@/components/mode-toggle"
import { NotificationDropdown } from "@/components/notification-dropdown"
import { CheckSquareIcon } from "lucide-react"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar fixa */}
      <div className="hidden md:flex w-64 flex-col fixed inset-y-0 z-50 border-r bg-background">
        <div className="h-16 flex items-center border-b px-6">
          <div className="flex items-center gap-2">
            <CheckSquareIcon className="h-6 w-6 text-white" />
            <h1 className="text-lg font-semibold">Focalize</h1>
          </div>
        </div>
        <div className="flex-1 overflow-auto py-2">
          <DashboardNav />
        </div>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 md:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b bg-background px-6">
          <div className="flex-1 flex items-center gap-2">
            <CheckSquareIcon className="h-6 w-6 text-primary md:hidden" />
            <h1 className="text-lg font-semibold md:hidden">Focalize</h1>
          </div>
          <div className="flex items-center gap-4">
            <NotificationDropdown />
            <ModeToggle />
            <UserNav />
          </div>
        </header>

        {/* Conteúdo da página */}
        <main className="p-6 w-full max-w-full">{children}</main>
      </div>
    </div>
  )
}
