import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"  // Importando a função de verificação de token

function formatToMySQLDateTime(isoDate: string) {
  return new Date(isoDate).toISOString().slice(0, 19).replace("T", " ")
}

// Função PATCH para atualizar o status da tarefa (incluindo o arquivamento)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any;
  try {
    decoded = verifyToken(req); // Verifica o token
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 }); // Token inválido
  }

  const userEntities = decoded.entities || []; // Entidades do usuário logado
  const taskId = params.id;

  try {
    const { status, completedAt } = await req.json();

    if (!status) {
      return NextResponse.json({ success: false, message: "Status é obrigatório." }, { status: 400 });
    }

    // Verificar se a tarefa pertence à entidade do usuário
    const [task]: any = await db.query("SELECT entity, assignee, project FROM tasks WHERE id = ?", [taskId]);
    if (!task || !userEntities.includes(task[0].entity)) {
      return NextResponse.json({ success: false, message: "Você não tem permissão para atualizar o status desta tarefa." }, { status: 403 });
    }

    // Verificar se o usuário é o responsável pela tarefa
    if (task[0].assignee !== decoded.id) {
      return NextResponse.json({ success: false, message: "Você não pode atualizar o status dessa tarefa." }, { status: 403 });
    }

    // Se o status for "archived", vamos registrar a data de arquivamento
    if (status === "archived") {
      const archivedAt = new Date().toISOString();
      await db.execute(
        `UPDATE tasks SET status = ?, archivedAt = ? WHERE id = ?`,
        [status, archivedAt ? formatToMySQLDateTime(archivedAt) : null, taskId]
      );
    } else {
      await db.execute(
        `UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?`,
        [status, completedAt ? formatToMySQLDateTime(completedAt) : null, taskId]
      );
    }

    // Se a tarefa foi completada, adicionar o ID da tarefa ao campo completeTasks no projeto
    if (status === "completed" && task[0].project) {
      // Atualiza o campo 'completeTasks' no projeto associado
      await db.execute(
        "UPDATE projects SET completeTasks = JSON_ARRAY_APPEND(completeTasks, '$', ?) WHERE id = ?",
        [taskId, task[0].project]
      );
    }

    return NextResponse.json({ success: true, message: "Status da tarefa atualizado com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar status da tarefa:", error);
    return NextResponse.json({ success: false, message: "Erro interno ao atualizar status." }, { status: 500 });
  }
}

// Função PUT para atualizar as informações da tarefa
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any;
  try {
    decoded = verifyToken(req); // Verifica o token
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 }); // Token inválido
  }

  const userEntities = decoded.entities || []; // Entidades do usuário logado
  const taskId = params.id;

  try {
    const { title, description, client, assignee, status } = await req.json();

    if (!title || !description || !client || !assignee || !status) {
      return NextResponse.json({ success: false, message: "Campos obrigatórios não preenchidos." }, { status: 400 });
    }

    // Verificar se a tarefa pertence à entidade do usuário
    const [task]: any = await db.query("SELECT entity, assignee, project FROM tasks WHERE id = ?", [taskId]);
    if (!task || !userEntities.includes(task[0].entity)) {
      return NextResponse.json({ success: false, message: "Você não tem permissão para editar esta tarefa." }, { status: 403 });
    }

    // Verificar se o usuário é o responsável pela tarefa
    if (task[0].assignee !== decoded.id) {
      return NextResponse.json({ success: false, message: "Você não pode editar essa tarefa." }, { status: 403 });
    }

    // Atualiza a tarefa no banco de dados
    await db.execute(
      `UPDATE tasks SET 
        title = ?, 
        description = ?, 
        client = ?, 
        assignee = ?, 
        status = ? 
      WHERE id = ?`,
      [title, description, client, assignee, status, taskId]
    );

    // Se a tarefa for completada, atualizar o campo completeTasks no projeto
    if (status === "completed" && task[0].project) {
      // Adicionar o ID da tarefa ao campo completeTasks no projeto
      await db.execute(
        "UPDATE projects SET completeTasks = JSON_ARRAY_APPEND(completeTasks, '$', ?) WHERE id = ?",
        [taskId, task[0].project]
      );
    }

    return NextResponse.json({ success: true, message: "Tarefa atualizada com sucesso." });
  } catch (error) {
    console.error("Erro ao atualizar tarefa:", error);
    return NextResponse.json({ success: false, message: "Erro ao atualizar tarefa." }, { status: 500 });
  }
}


// Função DELETE para excluir a tarefa
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any
  try {
    decoded = verifyToken(req)  // Verifica o token e retorna os dados do usuário
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Token inválido
  }

  const userEntities = decoded.entities || []  // Entidades do usuário logado
  const taskId = params.id

  try {
    // Verificar se a tarefa pertence à entidade do usuário
    const [task]: any = await db.query("SELECT entity, assignee FROM tasks WHERE id = ?", [taskId])
    if (!task || !userEntities.includes(task[0].entity)) {
      return NextResponse.json({ success: false, message: "Você não tem permissão para excluir esta tarefa." }, { status: 403 })
    }

    // Verificar se o usuário é o responsável pela tarefa
    if (task[0].assignee !== decoded.id) {
      return NextResponse.json({ success: false, message: "Você não pode excluir essa tarefa." }, { status: 403 })
    }

    // Excluir as tags associadas à tarefa
    await db.execute(`DELETE FROM task_tags WHERE taskId = ?`, [taskId])

    // Excluir a tarefa
    const [result]: any = await db.execute(`DELETE FROM tasks WHERE id = ?`, [taskId])

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Tarefa não encontrada." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Tarefa excluída com sucesso." })
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error)
    return NextResponse.json({ success: false, message: "Erro ao excluir tarefa." }, { status: 500 })
  }
}
