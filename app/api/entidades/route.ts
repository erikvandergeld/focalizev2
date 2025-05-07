import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"

// Função para garantir que as conexões sejam fechadas corretamente
async function safeQuery(query: string, values: any[]) {
  const connection = await db.getConnection()  // Obtém uma conexão do pool
  try {
    const [rows]: any = await connection.execute(query, values)  // Executa a consulta
    return rows
  } finally {
    connection.release()  // Libera a conexão para o pool
  }
}

// Função para criar entidades
export async function POST(req: NextRequest) {
  // Verificando o token e permissões do usuário
  let decoded: any
  try {
    decoded = verifyToken(req) // Verifica token e obtém dados do usuário
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  // Verifica se o usuário tem a permissão "acess_config"
  if (!decoded.permissions || !decoded.permissions.includes("acess_config")) {
    return NextResponse.json({ success: false, message: "Permissão negada" }, { status: 403 })
  }

  try {
    const { id, name } = await req.json()

    if (!id || !name) {
      return NextResponse.json({ success: false, message: "ID e nome são obrigatórios." }, { status: 400 })
    }

    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

    await safeQuery(
      "INSERT INTO entities (id, name, createdAt) VALUES (?, ?, ?)",
      [id, name, createdAt]
    )

    return NextResponse.json({ success: true, message: "Entidade criada com sucesso." })
  } catch (error) {
    console.error("Erro ao cadastrar entidade:", error)
    return NextResponse.json({ success: false, message: "Erro ao cadastrar entidade." }, { status: 500 })
  }
}

// Função para buscar entidades
export async function GET(req: NextRequest) {
  // Verificando o token e permissões do usuário
  let decoded: any
  try {
    decoded = verifyToken(req) // Verifica o token JWT
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  try {
    const rows = await safeQuery("SELECT * FROM entities ORDER BY name ASC", [])

    return NextResponse.json({
      success: true,
      entidades: rows,
    })
  } catch (error) {
    console.error("Erro ao buscar entidades:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar entidades." }, { status: 500 })
  }
}
