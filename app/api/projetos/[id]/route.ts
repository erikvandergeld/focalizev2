import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import jwt from "jsonwebtoken"

function checkPermission(req: NextRequest) {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) return null

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "*default-secret*") as any
    if (!decoded.permissions || !decoded.permissions.includes("acess_config")) return null
    return decoded
  } catch {
    return null
  }
}


export async function PUT(req: Request, { params }: { params: { id: string } }) {
    const id = params.id
    const body = await req.json()
  
    const { name, description, client, entity, status } = body
  
    if (!name || !client || !entity || !status) {
      return NextResponse.json(
        { success: false, message: "Campos obrigatórios faltando." },
        { status: 400 }
      )
    }
  
    try {
      const [result] = await db.query(
        `UPDATE projects
         SET name = ?, description = ?, client = ?, entity = ?, status = ?, updatedAt = NOW()
         WHERE id = ?`,
        [name, description, client, entity, status, id]
      )
  
      return NextResponse.json({ success: true, message: "Projeto atualizado com sucesso." })
    } catch (error) {
      console.error("[PUT /projetos/:id]", error)
      return NextResponse.json(
        { success: false, message: "Erro ao atualizar projeto." },
        { status: 500 }
      )
    }
  }