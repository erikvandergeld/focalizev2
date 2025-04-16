import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import jwt from "jsonwebtoken"

// Função auxiliar para validar token e permissão
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

export async function POST(req: NextRequest) {
  const permissionCheck = await checkPermission(req)
  if (!permissionCheck.authorized) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  try {
    const { id, name } = await req.json()

    if (!id || !name) {
      return NextResponse.json({ success: false, message: "ID e nome são obrigatórios." }, { status: 400 })
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

    await db.execute(
      "INSERT INTO entities (id, name, createdAt) VALUES (?, ?, ?)",
      [id, name, createdAt]
    )

    return NextResponse.json({ success: true, message: "Entidade criada com sucesso." })
  } catch (error) {
    console.error("Erro ao cadastrar entidade:", error)
    return NextResponse.json({ success: false, message: "Erro ao cadastrar entidade." }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  const permissionCheck = await checkPermission(req)
  if (!permissionCheck.authorized) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  try {
    const [rows]: any = await db.query("SELECT * FROM entities ORDER BY name ASC")

    return NextResponse.json({
      success: true,
      entidades: rows,
    })
  } catch (error) {
    console.error("Erro ao buscar entidades:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar entidades." }, { status: 500 })
  }
}
