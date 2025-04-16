import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function PUT(req: NextRequest, context: { params: { id: string } }) {
  const userId = context.params.id

  try {
    const body = await req.json()

    const { firstName, lastName, email, entities, permissions } = body

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
