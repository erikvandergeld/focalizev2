// app/api/cadastro/route.ts
import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

export async function POST(req: NextRequest) {
  // 1. Verificar o token JWT
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) {
    return NextResponse.json({ success: false, message: "Token não fornecido." }, { status: 401 })
  }

  let decoded: any
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET || "*Ingline.Sys#9420%")
  } catch (err) {
    return NextResponse.json({ success: false, message: "Token inválido." }, { status: 401 })
  }

  // 2. Verificar permissão
  if (!decoded.permissions || !decoded.permissions.includes("acess_config")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })
  }

  // 3. Obter e validar os dados do body
  const { firstName, lastName, email, password, entities, permissions } = await req.json()

  if (
    !firstName || !lastName || !email || !password ||
    !Array.isArray(entities) || !Array.isArray(permissions)
  ) {
    return NextResponse.json({ success: false, message: "Dados inválidos" }, { status: 400 })
  }

  // 4. Inserir usuário
  try {
    const hash = await bcrypt.hash(password, 10)

    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")
    await db.execute(
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

    return NextResponse.json({ success: true, message: "Usuário criado com sucesso" })
  } catch (error) {
    console.error("Erro ao cadastrar usuário:", error)
    return NextResponse.json({ success: false, message: "Erro ao cadastrar usuário" }, { status: 500 })
  }
}
