"use client"

import type React from "react"
import { createContext, useContext, useState, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"

type Notification = {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: Date
}

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (title: string, message: string) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const addNotification = useCallback(
    (title: string, message: string) => {
      const newNotification: Notification = {
        id: Date.now().toString(),
        title,
        message,
        read: false,
        timestamp: new Date(),
      }

      // Usar uma função de atualização de estado para garantir que estamos trabalhando com o estado mais recente
      setNotifications((prev) => [newNotification, ...prev])

      // Usar setTimeout para garantir que o toast seja mostrado após a renderização
      setTimeout(() => {
        toast({
          title: title,
          description: message,
          action: (
            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Bell className="h-4 w-4" />
            </div>
          ),
        })
      }, 0)
    },
    [toast],
  )

  const markAsRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((notification) => (notification.id === id ? { ...notification, read: true } : notification)),
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])

  const clearNotifications = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
