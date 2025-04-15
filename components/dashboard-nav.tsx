"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, CheckSquare, Users, Settings, LogOut, Archive, FolderKanban, Tag } from "lucide-react"
import { useAuth } from "./auth-provider"
import { cn } from "@/lib/utils"

export function DashboardNav() {
  const pathname = usePathname()
  const { logout } = useAuth()

  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
    },
    {
      label: "Tarefas",
      icon: CheckSquare,
      href: "/dashboard/tasks",
      active: pathname.includes("/dashboard/tasks") && !pathname.includes("/archived"),
    },
    {
      label: "Arquivadas",
      icon: Archive,
      href: "/dashboard/archived",
      active: pathname.includes("/dashboard/archived"),
    },
    {
      label: "Projetos",
      icon: FolderKanban,
      href: "/dashboard/projects",
      active: pathname.includes("/dashboard/projects"),
    },
    {
      label: "Clientes",
      icon: Users,
      href: "/dashboard/clients",
      active: pathname.includes("/dashboard/clients"),
    },
    {
      label: "Tags",
      icon: Tag,
      href: "/dashboard/tags",
      active: pathname.includes("/dashboard/tags"),
    },
    {
      label: "Configurações",
      icon: Settings,
      href: "/dashboard/settings",
      active: pathname.includes("/dashboard/settings"),
    },
  ]

  return (
    <div className="flex flex-col gap-2 px-2">
      <div className="py-2">
        <h2 className="px-4 text-lg font-semibold tracking-tight">Menu</h2>
        <div className="space-y-1 py-2">
          {routes.map((route) => (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent",
                route.active ? "bg-accent text-accent-foreground" : "text-muted-foreground",
              )}
            >
              <route.icon className="h-4 w-4" />
              <span>{route.label}</span>
            </Link>
          ))}
        </div>
      </div>
      <div className="py-2">
        <Link
          href="#"
          onClick={(e) => {
            e.preventDefault()
            logout()
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent text-muted-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Sair</span>
        </Link>
      </div>
    </div>
  )
}
