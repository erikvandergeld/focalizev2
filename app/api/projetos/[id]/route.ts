import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"  // Importando a função verifyToken

// Função PUT para atualizar um projeto
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any
  try {
    decoded = verifyToken(req)  // Verifica o token e decodifica
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Se token inválido, retorna 401
  }

  // Verifica se o usuário tem permissão para editar projetos
  if (!decoded.permissions?.includes("create_task")) { 
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })  // Se não tem permissão, retorna 403
  }

  const userEntities = decoded.entities || []  // Entidades do usuário logado
  const { name, description, client, entity, status } = await req.json()

  if (!name || !client || !entity || !status) {
    return NextResponse.json({ success: false, message: "Campos obrigatórios faltando." }, { status: 400 })  // Validação de campos obrigatórios
  }

  // Verifica se a entidade fornecida pertence ao usuário
  if (!userEntities.includes(entity)) {
    return NextResponse.json({ success: false, message: "Você não tem permissão para atualizar projetos nesta entidade." }, { status: 403 })  // Se a entidade não pertence ao usuário, retorna 403
  }

  try {
    const [result]: any = await db.query(
      `UPDATE projects
       SET name = ?, description = ?, client = ?, entity = ?, status = ?, updatedAt = NOW()
       WHERE id = ?`,
      [name, description, client, entity, status, params.id]
    )

    // Verifica se o projeto foi encontrado e atualizado
    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Projeto não encontrado." }, { status: 404 })  // Se não encontrou o projeto, retorna 404
    }

    return NextResponse.json({ success: true, message: "Projeto atualizado com sucesso." })  // Sucesso ao atualizar
  } catch (error) {
    console.error("Erro ao atualizar projeto:", error)
    return NextResponse.json({ success: false, message: "Erro ao atualizar projeto." }, { status: 500 })  // Se houver erro, retorna 500
  }
}

// Função GET para recuperar um projeto
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any
  try {
    decoded = verifyToken(req)  // Verifica o token e decodifica
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Se token inválido, retorna 401
  }

  // Verifica se o usuário tem permissão para visualizar projetos
  if (!decoded.permissions?.includes("delete_project")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })  // Se não tem permissão, retorna 403
  }

  const userEntities = decoded.entities || []  // Entidades do usuário logado

  try {
    const [project]: any = await db.query(
      `SELECT id, name, description, client, entity, status
       FROM projects
       WHERE id = ?`,
      [params.id]
    )

    // Verifica se o projeto foi encontrado
    if (!project) {
      return NextResponse.json({ success: false, message: "Projeto não encontrado." }, { status: 404 })  // Se não encontrou o projeto, retorna 404
    }

    // // Verifica se a entidade do projeto pertence ao usuário
    // if (!userEntities.includes(project.entity)) {
    //   console.log(project.entity);
    //   return NextResponse.json({ success: false, message: "Você não tem permissão para acessar este projeto." }, { status: 403 })  // Se a entidade não pertence ao usuário, retorna 403
    // }

    // Retorna os dados do projeto
    return NextResponse.json({ success: true, project })  // Sucesso, retornando os dados do projeto

  } catch (error) {
    console.error("Erro ao recuperar projeto:", error)
    return NextResponse.json({ success: false, message: "Erro ao recuperar projeto." }, { status: 500 })  // Se houver erro, retorna 500
  }
}