import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // Assumindo que você tem um arquivo de configuração de DB

// Função segura para execução de consultas com liberação da conexão
async function safeQuery(query: string, values: any[]) {
  const connection = await db.getConnection();  // Obtém uma conexão do pool
  try {
    const [result]: any = await connection.execute(query, values);  // Executa a consulta
    return result;
  } finally {
    connection.release();  // Libera a conexão para o pool
  }
}

// Função para salvar a notificação
export async function POST(req: NextRequest) {
  try {
    const { title, message, userId } = await req.json();

    // Criação do ID da notificação
    const notificationId = `notification-${Date.now()}`;

    // Insere a notificação na tabela 'notifications'
    await safeQuery(
      "INSERT INTO notifications (id, title, message, `read`, timestamp) VALUES (?, ?, ?, ?, ?)",
      [notificationId, title, message, 0, new Date()]  // O valor 0 para 'read' indicando que a notificação está não lida
    );

    // Insere a notificação para todos os usuários
    const users = await safeQuery("SELECT id FROM users", []);

    for (let user of users) {
      await safeQuery(
        "INSERT INTO user_notifications (user_id, notification_id, `read`, visualizada) VALUES (?, ?, ?, ?)",
        [user.id, notificationId, 0, 0]  // Adiciona 'read' e 'visualizada' como 0
      );
    }

    return NextResponse.json({ success: true, message: "Notificação salva com sucesso." });
  } catch (error) {
    console.error("Erro ao salvar notificação:", error);
    return NextResponse.json({ success: false, message: "Erro ao salvar notificação." }, { status: 500 });
  }
}

// Função para buscar notificações
export async function GET(req: NextRequest) {
  try {
    const userId = req.headers.get("x-user-id");
    if (!userId) {
      return NextResponse.json({ success: false, message: "Usuário não autenticado." }, { status: 401 });
    }

    // Buscar notificações não lidas
    const notifications = await safeQuery(
      `SELECT n.*, IFNULL(un.read, 0) AS user_read
       FROM notifications n
       LEFT JOIN user_notifications un 
       ON n.id = un.notification_id AND un.user_id = ?
       WHERE (un.user_id IS NULL OR un.read = 0)
       ORDER BY n.timestamp DESC`,
      [userId]
    );

    // Atualizar as notificações para "lidas" quando todos os usuários lerem
    for (const notification of notifications) {
      const notificationId = notification.id;

      const unreadUsers = await safeQuery(
        `SELECT COUNT(*) AS unread_count
         FROM user_notifications
         WHERE notification_id = ? AND \`read\` = 0`,
        [notificationId]
      );

      if (unreadUsers[0].unread_count === 0) {
        await safeQuery("UPDATE notifications SET `read` = 1 WHERE id = ?", [notificationId]);
      }
    }

    return NextResponse.json({ success: true, notifications });
  } catch (error) {
    console.error("Erro ao buscar notificações:", error);
    return NextResponse.json({ success: false, message: "Erro ao buscar notificações." }, { status: 500 });
  }
}
