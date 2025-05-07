import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db" // Importando o pool de conexões
import bcrypt from "bcryptjs"
import { verifyToken } from "@/lib/auth-middleware"

export async function POST(req: NextRequest) {
  let decoded: any
  try {
    decoded = verifyToken(req)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  // Verificação de permissão
  if (!decoded.permissions || !decoded.permissions.includes("acess_config")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })
  }

  // Obter dados do body
  const { firstName, lastName, email, password, entities, permissions } = await req.json()

  // Validação de dados
  if (!firstName || !lastName || !email || !password || !Array.isArray(entities) || !Array.isArray(permissions)) {
    return NextResponse.json({ success: false, message: "Dados inválidos" }, { status: 400 })
  }

  try {
    const hash = await bcrypt.hash(password, 10)

    // Obter a conexão do pool
    const connection = await db.getConnection()

    // Realizar a inserção
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")
    await connection.execute(
      "INSERT INTO users (id, firstName, lastName, email, senha, entities, permissions, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        `user-${Date.now()}`,
        firstName,
        lastName,
        email,
        hash,
        JSON.stringify(entities),
        JSON.stringify(permissions),
        createdAt,
      ]
    )

    // Fechar a conexão após a operação
    connection.release()

    return NextResponse.json({ success: true, message: "Usuário criado com sucesso" })
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error)
    return NextResponse.json({ success: false, message: "Erro ao cadastrar usuário" }, { status: 500 })
  }
}
