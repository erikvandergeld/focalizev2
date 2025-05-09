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

  const { user } = useAuth()

  useEffect(() => {
    if (!user?.id) return
  
    const fetchNotifications :any  = async () => {
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
    async (title: string, message: string) => {
      // Verifica se o usuário está autenticado
      const user = localStorage.getItem("user");
      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      // Parse do user para obter o userId
      const parsedUser = JSON.parse(user);
      const userId = parsedUser.id;

      // Define os dados da nova notificação
      const newNotification: Notification = {
        id: Date.now().toString(), // ID único baseado no timestamp
        title,
        message,
        read: false, // Inicialmente a notificação é não lida
        timestamp: new Date(),
      };

      // Adiciona a notificação localmente no estado
      setNotifications((prev) => [newNotification, ...prev]);

      try {
        // Envia a requisição para o backend para salvar a notificação
        const response = await fetch("/api/notificacoes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...newNotification, // Envia todos os dados da notificação
            userId, // Inclui o userId para associar a notificação ao usuário
          }),
        });

        const data = await response.json();
        if (data.success) {
          // Exibe o toast de sucesso
          toast({
            title: title,
            description: message,
            action: (
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Bell className="h-4 w-4" />
              </div>
            ),
          });
        } else {
          console.error("Erro ao salvar notificação:", data.message);
        }
      } catch (error) {
        console.error("Erro ao enviar notificação:", error);
      }
    },
    [toast] // Recalcula a função sempre que o toast mudar
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
