import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { verifyToken } from "@/lib/auth-middleware"; // Importando a função de verificação do token

// Função para garantir a execução segura das consultas
async function safeQuery(query: string, values: any[] = []): Promise<any> {
  try {
    return await db.query(query, values);
  } catch (error) {
    console.error("Erro ao executar consulta:", error);
    throw new Error("Erro ao executar consulta SQL.");
  }
}

function formatToMySQLDateTime(date: string): string {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0'); // Mês (01-12)
  const day = String(d.getDate()).padStart(2, '0'); // Dia (01-31)
  const hours = String(d.getHours()).padStart(2, '0'); // Hora (00-23)
  const minutes = String(d.getMinutes()).padStart(2, '0'); // Minutos (00-59)
  const seconds = String(d.getSeconds()).padStart(2, '0'); // Segundos (00-59)

  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

// Função para verificar se o usuário pode editar a tarefa (somente quem a criou pode alterar o status)
const canEditTask = (decoded: any, taskCreatorId: string) => {
  return decoded.id === taskCreatorId;
}

// Função POST para criar uma tarefa
export async function POST(req: NextRequest) {
  let decoded: any;
  try {
    decoded = verifyToken(req); // Verifica o token
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 }); // Token inválido
  }

  if (!decoded.permissions?.includes("create_task")) { // Verifica se o usuário tem permissão para criar tarefas
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 }); // Sem permissão
  }

  const { title, description, client, assignee, status, taskType, entity, project, tags } = await req.json();

  if (!title || !entity || !client || !assignee || !status || !taskType) {
    return NextResponse.json({ success: false, message: "Campos obrigatórios não preenchidos." }, { status: 400 }); // Campos faltando
  }

  const taskId = `task-${Date.now()}`;
  const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ");

  try {
    // Inserção da tarefa na tabela 'tasks'
    await safeQuery(
      `INSERT INTO tasks 
        (id, title, description, client, assignee, status, taskType, entity, project, tags, createdAt) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        taskId,
        title,
        description || null,
        client,
        assignee,
        status,
        taskType,
        entity,
        project || null,
        JSON.stringify(tags || []),
        createdAt,
      ]
    );

    // Se a tarefa foi associada a tags, insira na tabela 'task_tags'
    if (Array.isArray(tags) && tags.length > 0) {
      const tagInserts = tags.map((tagId: string) =>
        safeQuery("INSERT INTO task_tags (taskId, tagId) VALUES (?, ?)", [taskId, tagId])
      );
      await Promise.all(tagInserts);
    }

    // Se um projeto foi fornecido, atualizar o campo 'activeTasks' na tabela 'projects'
    if (project) {
      // Verifica se o projeto existe
      const projectExists = await safeQuery(
        "SELECT id, activeTasks FROM projects WHERE id = ?",
        [project]
      );

      if (projectExists.length === 0) {
        return NextResponse.json({ success: false, message: "Projeto não encontrado." }, { status: 404 });
      }

      // Se o campo activeTasks for NULL ou vazio, inicializa com um array vazio
      const currentActiveTasks = projectExists[0].activeTasks ? JSON.parse(projectExists[0].activeTasks) : [];

      // Atualiza o campo 'activeTasks' do projeto com o ID da tarefa criada
      const updatedActiveTasks = [...currentActiveTasks, taskId];

      const result = await safeQuery(
        "UPDATE projects SET activeTasks = ? WHERE id = ?",
        [JSON.stringify(updatedActiveTasks), project]
      );

      console.log("Resultado da atualização do projeto:", result);
    }

    return NextResponse.json({ success: true, message: "Tarefa criada com sucesso." });
  } catch (error) {
    console.error("Erro ao criar tarefa:", error);
    return NextResponse.json({ success: false, message: "Erro ao criar tarefa." }, { status: 500 }); // Erro ao criar
  }
}

// Função DELETE para excluir uma tarefa
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any;
  try {
    decoded = verifyToken(req); // Verifica o token
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 }); // Token inválido
  }

  const taskId = params.id;

  try {
    // Verifica se o usuário pode excluir a tarefa (somente o criador pode excluir)
    const [task]: any = await safeQuery("SELECT * FROM tasks WHERE id = ?", [taskId]);

    if (!task || task.length === 0) {
      return NextResponse.json({ success: false, message: "Tarefa não encontrada." }, { status: 404 }); // Tarefa não encontrada
    }

    if (!canEditTask(decoded, task[0].creator)) { // Verifica se o usuário foi o criador
      return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 }); // Sem permissão para excluir
    }

    const [result]: any = await safeQuery("DELETE FROM tasks WHERE id = ?", [taskId]);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Erro ao excluir tarefa." }, { status: 500 }); // Erro ao excluir
    }

    return NextResponse.json({ success: true, message: "Tarefa excluída com sucesso." });
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error);
    return NextResponse.json({ success: false, message: "Erro ao excluir tarefa." }, { status: 500 }); // Erro ao excluir
  }
}

export async function GET(req: NextRequest) {
  let decoded: any;
  try {
    decoded = verifyToken(req); // Verifica o token
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 }); // Token inválido
  }

  const userEntities = decoded.entities || []; // Entidades do usuário logado

  try {
    // Consulta para pegar as tarefas com os dados principais
    const [tasks]: any = await safeQuery(`
      SELECT 
        t.id,
        t.title,
        t.description,
        c.name AS client,
        JSON_OBJECT('id', u.id, 'full_name', CONCAT(u.firstName, ' ', u.lastName)) AS assignee,
        e.id AS entity_id,
        e.name AS entity_name,
        p.name AS project,
        t.taskType,
        t.status,
        t.completedAt,
        t.archivedAt,
        t.createdAt
      FROM tasks t
      LEFT JOIN clients c ON t.client = c.id
      LEFT JOIN users u ON t.assignee = u.id
      LEFT JOIN entities e ON t.entity = e.id
      LEFT JOIN projects p ON t.project = p.id
      ORDER BY t.createdAt DESC
    `);

    // Filtra as tarefas que pertencem às entidades do usuário logado
    const filteredTasks = tasks.filter((task: any) =>
      userEntities.includes(task.entity_id)  // Comparar com o ID da entidade
    );

    // Verificar se existem tarefas antes de consultar as tags
    if (filteredTasks.length === 0) {
      return NextResponse.json({ success: false, message: "Nenhuma tarefa encontrada." }, { status: 404 });
    }

    // Agora, vamos apenas retornar as tarefas sem realizar nenhuma mudança
    const taskIds = filteredTasks.map((task: any) => task.id);

    // Consultar as tags associadas às tarefas filtradas
    const [tags]: any = await safeQuery(`
      SELECT tt.taskId, tg.id, tg.name, tg.color
      FROM task_tags tt
      JOIN tags tg ON tt.tagId = tg.id
      WHERE tt.taskId IN (?)`, [taskIds]);

    // Agrupar tags por tarefa
    const tagsMap: Record<string, any[]> = {};
    for (const tag of tags) {
      if (!tagsMap[tag.taskId]) {
        tagsMap[tag.taskId] = [];
      }
      tagsMap[tag.taskId].push({ id: tag.id, name: tag.name, color: tag.color });
    }

    // Consultar os comentários de cada tarefa
    const [comments]: any = await safeQuery(`
      SELECT 
        c.id AS commentId,
        c.text AS commentText,
        c.author AS commentAuthor,
        c.created_at AS commentCreatedAt,
        c.task_id
      FROM comments c
      WHERE c.task_id IN (?) 
      ORDER BY c.created_at DESC`, [taskIds]);

    // Agrupar os comentários por tarefa
    const commentsMap: Record<string, any[]> = {};
    for (const comment of comments) {
      if (!commentsMap[comment.task_id]) {
        commentsMap[comment.task_id] = [];
      }
      commentsMap[comment.task_id].push({
        id: comment.commentId,
        text: comment.commentText,
        author: comment.commentAuthor,
        createdAt: comment.commentCreatedAt
      });
    }

    // Consultar os anexos de cada tarefa
    const [attachments]: any = await safeQuery(`
      SELECT 
        a.id, a.task_id, a.file_name AS name, a.file_url AS url
      FROM anexos a
      WHERE a.task_id IN (?)`, [taskIds]);

    // Agrupar anexos por tarefa
    const attachmentsMap: Record<string, any[]> = {};
    for (const attachment of attachments) {
      if (!attachmentsMap[attachment.task_id]) {
        attachmentsMap[attachment.task_id] = [];
      }
      attachmentsMap[attachment.task_id].push({
        id: attachment.id,
        name: attachment.name,
        url: attachment.url,
      });
    }

    const tasksWithTagsCommentsAndAttachments = filteredTasks.map((task: any) => ({
      ...task,
      tags: tagsMap[task.id] || [],
      comments: commentsMap[task.id] || [],
      attachments: attachmentsMap[task.id] || []
    }));

    // Retornar a resposta com as tarefas, tags, comentários e anexos
    return NextResponse.json({ success: true, tasks: tasksWithTagsCommentsAndAttachments });
  } catch (error) {
    console.error("Erro ao buscar tarefas:", error);
    return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 }); // Erro ao buscar tarefas
  }
}
