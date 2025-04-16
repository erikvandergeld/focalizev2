import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import jwt from "jsonwebtoken"

// Middleware inline para validação do token e da permissão
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

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const permissionCheck = await checkPermission(req)
  if (!permissionCheck.authorized) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  const { id } = params

  if (!id) {
    return NextResponse.json({ success: false, message: "ID da entidade não informado." }, { status: 400 })
  }

  try {
    const [result]: any = await db.execute("DELETE FROM entities WHERE id = ?", [id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Entidade não encontrada." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Entidade excluída com sucesso." })
  } catch (error) {
    console.error("Erro ao excluir entidade:", error)
    return NextResponse.json({ success: false, message: "Erro ao excluir entidade." }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const permissionCheck = await checkPermission(req)
  if (!permissionCheck.authorized) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  const { id } = params
  const { name } = await req.json()

  if (!id || !name) {
    return NextResponse.json({ success: false, message: "ID e nome da entidade são obrigatórios." }, { status: 400 })
  }

  try {
    const [result]: any = await db.execute("UPDATE entities SET name = ? WHERE id = ?", [name, id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Entidade não encontrada." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Entidade atualizada com sucesso." })
  } catch (error) {
    console.error("Erro ao atualizar entidade:", error)
    return NextResponse.json({ success: false, message: "Erro ao atualizar entidade." }, { status: 500 })
  }
}
