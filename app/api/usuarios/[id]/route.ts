// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"  // Certifique-se de importar a função verifyToken

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const userId = context.params.id
  if (!userId) {
    return NextResponse.json({ success: false, message: "ID do usuário não informado" }, { status: 400 })
  }

  let decoded: any
  try {
    // Verificar o token e decodificar
    decoded = verifyToken(req)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Se o token for inválido, retorna 401
  }

  // Verificar se o usuário tem permissão para editar usuários
  if (!decoded.permissions?.includes("acess_config")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })  // Se não tem permissão, retorna 403
  }

  try {
    const body = await req.json()

    const { firstName, lastName, email, entities, permissions } = body

    // Verificar se todos os dados obrigatórios estão presentes e no formato correto
    if (!firstName || !lastName || !email || !Array.isArray(entities) || !Array.isArray(permissions)) {
      return NextResponse.json({ success: false, message: "Dados inválidos" }, { status: 400 })
    }

    const [result] = await db.execute(
      `
      UPDATE users
      SET firstName = ?, lastName = ?, email = ?, entities = ?, permissions = ?
      WHERE id = ?
      `,
      [
        firstName,
        lastName,
        email,
        JSON.stringify(entities),
        JSON.stringify(permissions),
        userId,
      ]
    )

    return NextResponse.json({ success: true, message: "Usuário atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ success: false, message: "Erro interno ao atualizar usuário" }, { status: 500 })
  }
}
