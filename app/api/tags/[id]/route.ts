import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import jwt from "jsonwebtoken"

// 🔐 Verificador de permissão
async function checkPermission(req: NextRequest): Promise<{ authorized: boolean; decoded?: any }> {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) return { authorized: false }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "*Ingline.Sys#9420%") as any

    if (!decoded.permissions || !decoded.permissions.includes("acess_config")) {
      return { authorized: false }
    }

    return { authorized: true, decoded }
  } catch {
    return { authorized: false }
  }
}

// ✅ PUT: Atualizar tag
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const permissionCheck = await checkPermission(req)
  if (!permissionCheck.authorized) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  const { id } = params
  const { name, color } = await req.json()

  if (!name || !color) {
    return NextResponse.json({ success: false, message: "Nome e cor são obrigatórios." }, { status: 400 })
  }

  try {
    await db.execute("UPDATE tags SET name = ?, color = ? WHERE id = ?", [name, color, id])

    return NextResponse.json({
      success: true,
      tag: {
        id,
        name,
        color,
      },
    })
  } catch (error) {
    console.error("Erro ao atualizar tag:", error)
    return NextResponse.json({ success: false, message: "Erro ao atualizar a tag." }, { status: 500 })
  }
}

// ✅ DELETE: Remover tag (se não estiver em uso)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const permissionCheck = await checkPermission(req)
  if (!permissionCheck.authorized) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  const tagId = params.id

  try {
    // 🕵️ Verifica se algum cliente está usando essa tag
    const [clientsUsingTag]: any = await db.query(
      "SELECT id FROM clients WHERE JSON_CONTAINS(tags, JSON_QUOTE(?))",
      [tagId]
    )

    if (clientsUsingTag.length > 0) {
      return NextResponse.json({
        success: false,
        message: "Não é possível excluir uma tag vinculada a um ou mais clientes.",
      }, { status: 400 })
    }

    // ✅ Se não estiver em uso, exclui
    const [result]: any = await db.query("DELETE FROM tags WHERE id = ?", [tagId])

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Tag não encontrada." }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Erro ao excluir tag:", error)
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 })
  }
}
