// src/api/tarefas/[id]/comentarios/route.ts

import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db"
import jwt from "jsonwebtoken"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const taskId = params.id;

  try {
    const [rows]: any = await db.query(
      "SELECT * FROM comments WHERE task_id = ? ORDER BY created_at DESC",
      [taskId]
    );

    return NextResponse.json({
      success: true,
      comments: rows.map((row: any) => ({
        id: row.id,
        text: row.text,
        author: row.author,
        createdAt: row.created_at,
      })),
    });
  } catch (error) {
    console.error("Erro ao buscar comentários:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao buscar comentários." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const taskId = params.id;
  const { text, author, mentionedUserIds } = await req.json();

  console.log("Menções recebidas no backend:", mentionedUserIds);

  if (!text || !author) {
    return NextResponse.json(
      { success: false, message: "Texto e autor são obrigatórios." },
      { status: 400 }
    );
  }

  const commentId = `comment-${Date.now()}`;

  try {
    // ✅ Adicionar o comentário ao banco de dados
    await db.query(
      "INSERT INTO comments (id, task_id, text, author) VALUES (?, ?, ?, ?)",
      [commentId, taskId, text, author]
    );

    // ✅ Criar uma notificação geral (sem user_id e sem link)
    const notificationId = `notification-${Date.now()}`;
    await db.query(
      "INSERT INTO notifications (id, title, message, `read`, timestamp) VALUES (?, ?, ?, ?, NOW())",
      [
        notificationId,
        "Você foi mencionado!",
        `Você foi mencionado em um comentário na tarefa ${taskId}.`,
        0  // Notificação não lida
      ]
    );

    // ✅ Vincular os usuários mencionados na tabela user_notifications
    if (mentionedUserIds && mentionedUserIds.length > 0) {
      console.log("Enviando notificações para usuários mencionados:", mentionedUserIds);

      const userNotificationQueries = mentionedUserIds.map((userId: any) =>
        db.query(
          "INSERT INTO user_notifications (user_id, notification_id, `read`, visualizada, timestamp) VALUES (?, ?, ?, ?, NOW())",
          [userId, notificationId, 0, 0]  // Marcar como não lida e não visualizada
        )
      );

      await Promise.all(userNotificationQueries);
    }

    return NextResponse.json({ success: true, message: "Comentário adicionado e notificações enviadas." });
  } catch (error) {
    console.error("Erro ao adicionar comentário:", error);
    return NextResponse.json(
      { success: false, message: "Erro ao adicionar comentário." },
      { status: 500 }
    );
  }
}