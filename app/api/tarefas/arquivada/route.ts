import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"

// Função para verificar se o usuário pode editar a tarefa (somente quem a criou pode alterar o status)
const canEditTask = (decoded: any, taskCreatorId: string) => {
  return decoded.id === taskCreatorId
}


// Função GET para buscar tarefas (filtrando pela entidade do usuário)
export async function GET(req: NextRequest) {
    let decoded: any
    try {
      decoded = verifyToken(req)  // Verifica o token
    } catch (err: any) {
      return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Token inválido
    }
  
    const userEntities = decoded.entities || []  // Entidades do usuário logado
  
    try {
      // Adicionar filtro para buscar somente tarefas arquivadas
      const [tasks]: any = await db.query(`
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
          WHERE t.status = 'archived'  -- Filtro para tarefas arquivadas
          ORDER BY t.archivedAt DESC
        `)
  
      // Filtra as tarefas que pertencem às entidades do usuário logado
      const filteredTasks = tasks.filter((task: any) =>
        userEntities.includes(task.entity_id)  // Comparar com o ID da entidade
      )
  
      // Consultar as tags associadas às tarefas filtradas
      const [tags]: any = await db.query(`
          SELECT tt.taskId, tg.id, tg.name, tg.color
          FROM task_tags tt
          JOIN tags tg ON tt.tagId = tg.id
          WHERE tt.taskId IN (?)
        `, [filteredTasks.map((task: any) => task.id)])
  
      // Agrupar tags por tarefa
      const tagsMap: Record<string, any[]> = {}
      for (const tag of tags) {
        if (!tagsMap[tag.taskId]) {
          tagsMap[tag.taskId] = []
        }
        tagsMap[tag.taskId].push({ id: tag.id, name: tag.name, color: tag.color })
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
        `, [filteredTasks.map((task: any) => task.id)])
  
      // Agrupar os comentários por tarefa
      const commentsMap: Record<string, any[]> = {}
      for (const comment of comments) {
        if (!commentsMap[comment.task_id]) {
          commentsMap[comment.task_id] = []
        }
        commentsMap[comment.task_id].push({
          id: comment.commentId,
          text: comment.commentText,
          author: comment.commentAuthor,
          createdAt: comment.commentCreatedAt
        })
      }
  
      // Consultar os anexos de cada tarefa
      const [attachments]: any = await db.query(`
    SELECT 
      a.id, a.task_id, a.file_name AS name, a.file_url AS url
    FROM anexos a
    WHERE a.task_id IN (?)
  `, [filteredTasks.map((task: any) => task.id)])
  
      // Agrupar anexos por tarefa
      const attachmentsMap: Record<string, any[]> = {}
      for (const attachment of attachments) {
        if (!attachmentsMap[attachment.task_id]) {
          attachmentsMap[attachment.task_id] = []
        }
        attachmentsMap[attachment.task_id].push({
          id: attachment.id,
          name: attachment.name,
          url: attachment.url,
        })
      }
  
      const tasksWithTagsCommentsAndAttachments = filteredTasks.map((task: any) => ({
        ...task,
        tags: tagsMap[task.id] || [],
        comments: commentsMap[task.id] || [],
        attachments: attachmentsMap[task.id] || [] // ⬅️ Adiciona aqui!
      }))
      // Retornar a resposta com as tarefas, tags e comentários
      return NextResponse.json({ success: true, tasks: tasksWithTagsCommentsAndAttachments })
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error)
      return NextResponse.json({ success: false, message: "Erro interno." }, { status: 500 })  // Erro ao buscar tarefas
    }
  }
  