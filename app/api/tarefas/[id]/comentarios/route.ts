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
    const { text, author } = await req.json();
  
    if (!text || !author) {
      return NextResponse.json(
        { success: false, message: "Texto e autor são obrigatórios." },
        { status: 400 }
      );
    }
  
    const commentId = `comment-${Date.now()}`; // Gerar um ID único para o comentário (ou use UUID)
  
    try {
      await db.query(
        "INSERT INTO comments (id, task_id, text, author) VALUES (?, ?, ?, ?)",
        [commentId, taskId, text, author]
      );
  
      return NextResponse.json({ success: true, message: "Comentário adicionado." });
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      return NextResponse.json(
        { success: false, message: "Erro ao adicionar comentário." },
        { status: 500 }
      );
    }
  }