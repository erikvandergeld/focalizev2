// app/api/usuarios/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"  // Certifique-se de importar a função verifyToken
import bcrypt from "bcryptjs"

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

    console.log('Dados recebidos para atualização:', body)
    const { firstName, lastName, email, password, entities, permissions } = body

    // Verificar se todos os dados obrigatórios estão presentes e no formato correto
    if (!firstName || !lastName || !email || !Array.isArray(entities) || !Array.isArray(permissions)) {
      return NextResponse.json({ success: false, message: "Dados inválidos" }, { status: 400 })
    }

    // Prepara a senha apenas se ela foi informada
    const updatedPassword = password ? await bcrypt.hash(password, 10) : null

    // Caso a senha não tenha sido fornecida, não alteramos a senha no banco
    const query = `
      UPDATE users
      SET firstName = ?, lastName = ?, email = ?, 
          entities = ?, permissions = ?, 
          ${updatedPassword ? "senha = ?" : ""}
      WHERE id = ?
    `

    const params = [
      firstName,
      lastName,
      email,
      JSON.stringify(entities),
      JSON.stringify(permissions),
      ...(updatedPassword ? [updatedPassword] : []), // Inclui a senha se fornecida
      userId,
    ]

    const [result] = await db.execute(query, params)

    // Verifica se a atualização foi bem-sucedida
    if ((result as any).affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Usuário não encontrado" }, { status: 404 })
    }


    return NextResponse.json({ success: true, message: "Usuário atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error)
    return NextResponse.json({ success: false, message: "Erro interno ao atualizar usuário" }, { status: 500 })
  }
}

// ✅ Método DELETE para excluir usuário
export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  const userId = context.params.id
  if (!userId) {
    return NextResponse.json({ success: false, message: "ID do usuário não informado" }, { status: 400 })
  }

  let decoded: any
  try {
    decoded = verifyToken(req)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  if (!decoded.permissions?.includes("acess_config")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })
  }

  try {
    // Primeiro, exclua todas as notificações do usuário em user_notifications
    await db.query("DELETE FROM user_notifications WHERE user_id = ?", [userId])

    // Agora, exclua o usuário
    await db.query("DELETE FROM users WHERE id = ?", [userId])

    return NextResponse.json({ success: true, message: "Usuário e notificações excluídos com sucesso." })
  } catch (error) {
    console.error("Erro ao excluir usuário:", error)
    return NextResponse.json({ success: false, message: "Erro interno ao excluir usuário" }, { status: 500 })
  }
}
