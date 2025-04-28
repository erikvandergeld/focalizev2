import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"; // Assumindo que você tem um arquivo de configuração de DB

// Função para salvar a notificação
export async function POST(req: NextRequest) {
    try {
        const { title, message, userId } = await req.json();

        // Criação do ID da notificação
        const notificationId = `notification-${Date.now()}`;

        // Insere a notificação na tabela 'notifications'
        await db.execute(
            "INSERT INTO notifications (id, title, message, `read`, timestamp) VALUES (?, ?, ?, ?, ?)",
            [notificationId, title, message, 0, new Date()]  // O valor 0 para 'read' indicando que a notificação está não lida
        );

        // Insere a notificação para todos os usuários
        const [users]: any = await db.query("SELECT id FROM users");

        for (let user of users) {
            await db.execute(
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

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id'); // O ID do usuário logado
        if (!userId) {
            return NextResponse.json({ success: false, message: "Usuário não autenticado." }, { status: 401 });
        }

        // Buscar notificações para o usuário com base no status 'read'
        const [notifications]: any = await db.query(
            `SELECT n.*, 
                IFNULL(un.read, 0) AS user_read 
         FROM notifications n
         LEFT JOIN user_notifications un ON n.id = un.notification_id AND un.user_id = ?
         WHERE un.read = 0 OR n.read = 0
         ORDER BY n.timestamp DESC`,
            [userId]
        );

        // Para cada notificação, verificamos se todos os usuários visualizaram
        for (const notification of notifications) {
            const notificationId = notification.id;

            // Verificar se todos os usuários visualizaram a notificação
            const [unreadUsers]: any = await db.query(
                `SELECT COUNT(*) AS unread_count
                 FROM user_notifications
                 WHERE notification_id = ? AND \`read\` = 0`,
                [notificationId]
            );

            if (unreadUsers[0].unread_count === 0) {
                // Se todos os usuários visualizaram a notificação, atualizamos a tabela de notificações
                await db.execute(
                    "UPDATE notifications SET `read` = 1 WHERE id = ?",
                    [notificationId]
                );
            }
        }

        return NextResponse.json({ success: true, notifications });
    } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        return NextResponse.json({ success: false, message: "Erro ao buscar notificações." }, { status: 500 });
    }
}
