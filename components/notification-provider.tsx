"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import { json } from "stream/consumers"
import { useAuth } from "@/components/auth-provider"

type Notification = {
  id: string
  title: string
  message: string
  read: boolean
  timestamp: Date
  userIds?: string[]  // Adicionando o campo de usuários mencionados
}

type NotificationContextType = {
  notifications: Notification[]
  unreadCount: number
  addNotification: (title: string, message: string, mentionedUserIds?: string[]) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  const unreadCount = notifications.filter((notification) => !notification.read).length

  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return

    const fetchNotifications: any = async () => {
      try {
        const token = localStorage.getItem("token")
        const response = await fetch("/api/notificacoes", {
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
            "x-user-id": user.id,
          },
        })

        const data = await response.json()

        if (data.success) {
          setNotifications(data.notifications)
          localStorage.setItem("notifications", JSON.stringify(data.notifications))
        } else {
          console.error("Erro ao buscar notificações:", data.message)
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error)
      }
    }

    // Chama a função uma vez quando o componente é montado
    fetchNotifications()

    // Cria um intervalo para chamar a função a cada 5 minutos (300000 ms)
    const intervalId = setInterval(fetchNotifications, 300000)  // 5 minutos

    // Limpa o intervalo quando o componente for desmontado
    return () => clearInterval(intervalId)

  }, [user?.id]) // ✅ escuta mudanças de usuário

  const addNotification = useCallback(
    async (title: string, message: string, mentionedUserIds?: string[]) => {
      console.log("Usuários mencionados recebidos na notificação:", mentionedUserIds);

      if (mentionedUserIds && mentionedUserIds.length > 0) {
        console.log("Notificando usuários mencionados:", mentionedUserIds);
        mentionedUserIds.forEach((userId) => {
          const newNotification = {
            id: `notification-${Date.now()}-${userId}`,
            title,
            message,
            read: false,
            timestamp: new Date(),
            userIds: [userId],
          };
          setNotifications((prev) => [newNotification, ...prev]);
        });
      } else {
        console.log("Notificando o próprio usuário");
        const newNotification = {
          id: Date.now().toString(),
          title,
          message,
          read: false,
          timestamp: new Date(),
        };
        setNotifications((prev) => [newNotification, ...prev]);
      }
    },
    [setNotifications]
  );


  const markAsRead = async (id: string) => {
    const user = localStorage.getItem("user");

    if (!user) {
      console.error("Usuário não autenticado");
      return;
    }

    const parsedUser = JSON.parse(user);
    const userId = parsedUser.id;

    if (!userId) {
      console.error("ID do usuário não encontrado");
      return;
    }

    try {
      const response = await fetch(`/api/notificacoes/${id}/marcar-como-lida`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id, userId: userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Atualiza a notificação localmente para o usuário
        setNotifications((prev) =>
          prev.map((notification) =>
            notification.id === id ? { ...notification, read: true } : notification
          )
        );
      } else {
        console.error("Erro ao marcar como lida:", data.message);
      }
    } catch (error) {
      console.error("Erro ao marcar a notificação como lida:", error);
    }
  };

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((notification) => ({ ...notification, read: true })))
  }, [])


  const clearNotifications = async () => {
    try {
      const user = localStorage.getItem("user");

      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      const parsedUser = JSON.parse(user);
      const userId = parsedUser.id;

      if (!userId) {
        console.error("ID do usuário não encontrado");
        return;
      }

      const response = await fetch("/api/notificacoes/limpar-todas", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),  // Enviamos o ID do usuário para a API
      });

      const data = await response.json();

      if (data.success) {
        // Atualizar estado local das notificações para marcá-las como lidas
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true, visualizada: true })) // Marca todas como lidas localmente
        );
      } else {
        console.error("Erro ao limpar notificações:", data.message);
      }
    } catch (error) {
      console.error("Erro ao limpar notificações:", error);
    }
  };


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
