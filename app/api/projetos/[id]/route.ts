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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any;
  try {
    decoded = verifyToken(req);
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 });
  }

  if (!decoded.permissions?.includes("delete_project")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 });
  }

  const id = params.id;

  try {
    const [rows]: any = await db.query(
      `SELECT 
         p.id, p.name, p.description, p.status, p.createdAt, p.updatedAt, p.initDate, p.completeDate, 
         p.activeTasks, p.completeTasks, p.membersTeam,
         c.name AS client_name, e.name AS entity_name
       FROM projects p
       LEFT JOIN clients c ON p.client = c.id
       LEFT JOIN entities e ON p.entity = e.id
       WHERE p.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: "Projeto não encontrado." }, { status: 404 });
    }

    const project = rows[0];

    // Tratamento para campos JSON
    let activeTasks = [];
    if (project.activeTasks) {
      try {
        activeTasks = JSON.parse(project.activeTasks);
        if (!Array.isArray(activeTasks)) activeTasks = [activeTasks];
      } catch {
        activeTasks = [project.activeTasks];
      }
    }

    let completeTasks = [];
    if (project.completeTasks) {
      try {
        completeTasks = JSON.parse(project.completeTasks);
        if (!Array.isArray(completeTasks)) completeTasks = [completeTasks];
      } catch {
        completeTasks = [project.completeTasks];
      }
    }

    let membersTeam = [];
    if (project.membersTeam) {
      try {
        membersTeam = project.membersTeam;
        if (!Array.isArray(membersTeam)) membersTeam = [membersTeam];
      } catch {
        membersTeam = [project.membersTeam];
      }
    }

    console.log(membersTeam);

    return NextResponse.json({
      success: true,
      project: {
        ...project,
        client: project.client_name,
        entity: project.entity_name,
        activeTasks,
        completeTasks,
        membersTeam,
      }  
    
     });
  } catch (error) {
    console.error("Erro ao recuperar projeto:", error);
    return NextResponse.json({ success: false, message: "Erro ao recuperar projeto." }, { status: 500 });
  }
}


export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any
  try {
    decoded = verifyToken(req)  // Verifica o token e decodifica
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Se token inválido, retorna 401
  }

  // Verifica se o usuário tem permissão para excluir projetos
  if (!decoded.permissions?.includes("delete_project")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })  // Se não tem permissão, retorna 403
  }

  const userEntities = decoded.entities || []  // Entidades do usuário logado

  try {
    // Verifica se o projeto pertence à entidade do usuário
    const [project]: any = await db.query("SELECT entity FROM projects WHERE id = ?", [params.id])
    if (!project || !userEntities.includes(project[0].entity)) {
      return NextResponse.json({ success: false, message: "Você não tem permissão para excluir este projeto." }, { status: 403 })  // Se a entidade não pertence ao usuário, retorna 403
    }

    // Exclui o projeto
    const [result]: any = await db.execute("DELETE FROM projects WHERE id = ?", [params.id])

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Projeto não encontrado." }, { status: 404 })  // Se não encontrou o projeto, retorna 404
    }

    return NextResponse.json({ success: true, message: "Projeto excluído com sucesso." })  // Sucesso ao excluir
  } catch (error) {
    console.error("Erro ao excluir projeto:", error)
    return NextResponse.json({ success: false, message: "Erro ao excluir projeto." }, { status: 500 })  // Se houver erro, retorna 500
  }

}