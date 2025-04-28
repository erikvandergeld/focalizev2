import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"




export async function POST(req: NextRequest) {
    //   const user = checkPermission(req)
    //   if (!user) {
    //     return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
    //   }

    try {
        const {
            title,
            description,
            client,
            assignee,
            status,
            taskType,
            entity,
            project,
            tags,
        } = await req.json()

        if (!title || !entity || !client || !assignee || !status || !taskType) {
            return NextResponse.json({ success: false, message: "Campos obrigatórios não preenchidos." }, { status: 400 })
        }

        const taskId = `task-${Date.now()}`
        const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

        await db.execute(
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
        )

        if (Array.isArray(tags) && tags.length > 0) {
            const tagInserts = tags.map((tagId: string) =>
                db.execute("INSERT INTO task_tags (taskId, tagId) VALUES (?, ?)", [taskId, tagId])
            )
            await Promise.all(tagInserts)
        }


        return NextResponse.json({ success: true, message: "Tarefa criada com sucesso." })
    } catch (error) {
        console.error("Erro ao criar tarefa:", error)
        return NextResponse.json({ success: false, message: "Erro ao criar tarefa." }, { status: 500 })
    }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const taskId = params.id

  try {
    // Opcional: verificação de autenticação
    const token = req.headers.get("authorization")?.replace("Bearer ", "")
    // if (!token || !(await verifyJWT(token))) {
    //   return NextResponse.json({ success: false, message: "Não autorizado." }, { status: 401 })
    // }

    const [result]: any = await db.query("DELETE FROM tasks WHERE id = ?", [taskId])

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Tarefa não encontrada." }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Tarefa excluída com sucesso." })
  } catch (error) {
    console.error("Erro ao excluir tarefa:", error)
    return NextResponse.json({ success: false, message: "Erro ao excluir tarefa." }, { status: 500 })
  }
}
export async function GET(req: NextRequest) {
    try {
        // Consulta para pegar as tarefas com os dados principais
        const [tasks]: any = await db.query(`
            SELECT 
              t.id,
              t.title,
              t.description,
              c.name AS client,
              JSON_OBJECT('id', u.id, 'full_name', CONCAT(u.firstName, ' ', u.lastName)) AS assignee,
              e.name AS entity,
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

        // Consulta para pegar as tags associadas às tarefas
        const [tags]: any = await db.query(`
            SELECT tt.taskId, tg.id, tg.name, tg.color
            FROM task_tags tt
            JOIN tags tg ON tt.tagId = tg.id
        `);

        // Agrupar tags por tarefa
        const tagsMap: Record<string, any[]> = {};
        for (const tag of tags) {
            if (!tagsMap[tag.taskId]) {
                tagsMap[tag.taskId] = [];
            }
            tagsMap[tag.taskId].push({ id: tag.id, name: tag.name, color: tag.color });
        }

        // Consultar os comentários de cada tarefa
        const [comments]: any = await db.query(`
            SELECT 
              c.id AS commentId,
              c.text AS commentText,
              c.author AS commentAuthor,
              c.created_at AS commentCreatedAt,
              c.task_id
            FROM comments c
            WHERE c.task_id IN (?)
            ORDER BY c.created_at DESC
        `, [tasks.map((task: any) => task.id)]);

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
        

        // Agora incluir tags e comentários nas tarefas
        const tasksWithTagsAndComments = tasks.map((task: any) => ({
            ...task,
            tags: tagsMap[task.id] || [],  // Incluindo as tags associadas à tarefa
            comments: commentsMap[task.id] || []  // Incluindo os comentários associados à tarefa
        }));

        // Retornar a resposta com as tarefas, tags e comentários
        return NextResponse.json({ success: true, tasks: tasksWithTagsAndComments });
    } catch (error) {
        console.error("Erro ao buscar tarefas:", error);
        return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 });
    }
}
