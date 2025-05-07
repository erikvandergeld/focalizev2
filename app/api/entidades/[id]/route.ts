import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"  // Importando a função de verificação do token

// Função segura para execução de consultas com liberação da conexão
async function safeQuery(query: string, values: any[]) {
  const connection = await db.getConnection()  // Obtém uma conexão do pool
  try {
    const [rows]: any = await connection.execute(query, values)  // Executa a consulta
    return rows
  } finally {
    connection.release()  // Libera a conexão para o pool
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  // Usando o middleware de verificação de permissão
  let decoded: any
  try {
    decoded = verifyToken(req)
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: "Erro desconhecido" }, { status: 401 })
  }

  // Verificar se o usuário tem a permissão "acess_config"
  if (!decoded.permissions?.includes("acess_config")) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  const { id } = params

  if (!id) {
    return NextResponse.json({ success: false, message: "ID da entidade não informado." }, { status: 400 })
  }

  try {
    const result = await safeQuery("DELETE FROM entities WHERE id = ?", [id])

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
  // Usando o middleware de verificação de permissão
  let decoded: any
  try {
    decoded = verifyToken(req)
  } catch (err) {
    if (err instanceof Error) {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 })
    }
    return NextResponse.json({ success: false, message: "Erro desconhecido" }, { status: 401 })
  }

  // Verificar se o usuário tem a permissão "acess_config"
  if (!decoded.permissions?.includes("acess_config")) {
    return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
  }

  const { id } = params
  const { name } = await req.json()

  if (!id || !name) {
    return NextResponse.json({ success: false, message: "ID e nome da entidade são obrigatórios." }, { status: 400 })
  }

  try {
    const result = await safeQuery("UPDATE entities SET name = ? WHERE id = ?", [name, id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Entidade não encontrada." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Entidade atualizada com sucesso." })
  } catch (error) {
    console.error("Erro ao atualizar entidade:", error)
    return NextResponse.json({ success: false, message: "Erro ao atualizar entidade." }, { status: 500 })
  }
}
