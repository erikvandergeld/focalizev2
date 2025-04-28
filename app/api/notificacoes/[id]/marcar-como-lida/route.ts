import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(req: NextRequest) {
    try {
        const { notificationId, userId } = await req.json(); // Recebe o ID da notificação e do usuário

        // Verifica se já existe uma entrada para o usuário e a notificação
        const [existingNotification]: any = await db.query(
            "SELECT * FROM user_notifications WHERE notification_id = ? AND user_id = ?",
            [notificationId, userId]
        );

        // Se não existir, inserimos a entrada
        if (existingNotification.length === 0) {
            await db.execute(
                "INSERT INTO user_notifications (user_id, notification_id, `read`) VALUES (?, ?, ?)",
                [userId, notificationId, 1]  // Marcar como lida (read = 1)
            );
        } else {
            // Se já existir, atualizamos o valor de `read` para 1 (lida)
            await db.execute(
                "UPDATE user_notifications SET `read` = 1 WHERE notification_id = ? AND user_id = ?",
                [notificationId, userId]
            );
        }

        // Verificar se todos os usuários visualizaram a notificação
        const [unreadUsers]: any = await db.query(
            `SELECT COUNT(*) AS unread_count
             FROM user_notifications
             WHERE notification_id = ? AND \`read\` = 0`,
            [notificationId]
        );

        if (unreadUsers[0].unread_count === 0) {
            // Se todos os usuários visualizaram a notificação, atualizamos a coluna 'read' da notificação
            await db.execute(
                "UPDATE notifications SET `read` = 1 WHERE id = ?",
                [notificationId]
            );
        }

        return NextResponse.json({ success: true, message: "Notificação marcada como lida." });
    } catch (error) {
        console.error("Erro ao marcar a notificação como lida:", error);
        return NextResponse.json({ success: false, message: "Erro ao atualizar a notificação." }, { status: 500 });
    }
}
