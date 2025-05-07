import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function PATCH(req: NextRequest) {
  try {
    const { userId } = await req.json(); // Recebe o ID do usuário

    // Atualizar todas as notificações para o usuário com `read = 1` e `visualizada = 1`
    await db.execute(
      `UPDATE user_notifications 
       SET \`read\` = 1, \`visualizada\` = 1 
       WHERE user_id = ?`,
      [userId]
    );

    // Verificar se todas as notificações foram marcadas como lidas e visualizadas
    const [unreadUsers]: any = await db.query(
      `SELECT COUNT(*) AS unread_count
       FROM user_notifications
       WHERE notification_id IN (
           SELECT DISTINCT notification_id 
           FROM user_notifications 
           WHERE user_id = ?
       ) AND \`read\` = 0`,
      [userId]
    );

    // Se não houver mais usuários com a notificação não lida, podemos marcar a notificação como lida no nível global
    if (unreadUsers[0].unread_count === 0) {
      await db.execute(
        "UPDATE notifications SET `read` = 1 WHERE id IN (SELECT notification_id FROM user_notifications WHERE user_id = ?)",
        [userId]
      );
    }

    return NextResponse.json({ success: true, message: "Notificações marcadas como lidas e visualizadas." });
  } catch (error) {
    console.error("Erro ao marcar notificações como lidas:", error);
    return NextResponse.json({ success: false, message: "Erro ao atualizar notificações." }, { status: 500 });
  }
}
