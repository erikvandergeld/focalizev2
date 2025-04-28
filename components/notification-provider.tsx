"use client"

import { createContext, useContext, useState, useEffect, useCallback } from "react"
import { useToast } from "@/components/ui/use-toast"
import { Bell } from "lucide-react"
import { json } from "stream/consumers"

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

  useEffect(() => {
    const fetchNotifications = async () => {
      const user = localStorage.getItem("user");

      if (!user) {
        console.error("Usuário não autenticado");
        return;
      }

      const parsedUser = JSON.parse(user);
      const userId = parsedUser.id;

      const token = localStorage.getItem("token");

      if (!token) {
        console.error("Token não encontrado");
        return;
      }

      try {
        // Requisição ao backend para pegar as notificações com base no usuário
        const response = await fetch("/api/notificacoes", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`, // Passando o token de autenticação
            "x-user-id": userId, // Passando o userId como cabeçalho
          },
        });

        const data = await response.json();

        console.log("Notificações recebidas: (Verificando se vão receber a notificação)", data.notifications); // Log para verificar as notificações recebidas

        if (data.success) {
          // Aqui, no momento de resposta, você armazena as notificações no localStorage
          localStorage.setItem("notifications", JSON.stringify(data.notifications));  // Salva as notificações no localStorage
          setNotifications(data.notifications);  // Atualiza o estado com as novas notificações
        } else {
          console.error("Erro ao buscar notificações:", data.message);
        }
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
      }
    };

    fetchNotifications();
  }, []);


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

      const response = await fetch("/api/notificacoes", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();

      if (data.success) {
        // Atualizar estado local das notificações para marcá-las como lidas
        setNotifications((prev) =>
          prev.map((notification) => ({ ...notification, read: true })) // Marca todas como lidas localmente
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
