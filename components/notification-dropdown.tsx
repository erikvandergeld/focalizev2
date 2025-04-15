"use client"

import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useNotifications } from "./notification-provider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"

export function NotificationDropdown() {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useNotifications()

  const formatTimestamp = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notificações</span>
          {notifications.length > 0 && (
            <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" onClick={clearNotifications}>
              Limpar
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">Nenhuma notificação</div>
        ) : (
          <ScrollArea className="h-[300px]">
            {notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex flex-col items-start gap-1 p-3 ${!notification.read ? "bg-muted/50" : ""}`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex w-full justify-between">
                  <span className="font-medium">{notification.title}</span>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(notification.timestamp)}</span>
                </div>
                <p className="text-sm text-muted-foreground">{notification.message}</p>
              </DropdownMenuItem>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
