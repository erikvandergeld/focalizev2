import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
// import { checkPermission } from "@/lib/auth"

function formatToMySQLDateTime(isoDate: string) {
    return new Date(isoDate).toISOString().slice(0, 19).replace("T", " ")
  }
  


export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
    const taskId = params.id
  
    try {
        const { status, completedAt } = await req.json()
  
      if (!status) {
        return NextResponse.json({ success: false, message: "Status é obrigatório." }, { status: 400 })
      }
  
      await db.execute(
        `UPDATE tasks SET status = ?, completedAt = ? WHERE id = ?`,
        [status, completedAt ? formatToMySQLDateTime(completedAt) : null, taskId]
      )
  
      return NextResponse.json({ success: true, message: "Status da tarefa atualizado com sucesso." })
    } catch (error) {
      console.error("Erro ao atualizar status da tarefa:", error)
      return NextResponse.json({ success: false, message: "Erro interno ao atualizar status." }, { status: 500 })
    }
  }
  

  export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const taskId = params.id
  
    try {
      // Obtém os dados da requisição (somente os campos necessários)
      const { title, description, client, assignee, status } = await req.json()
  
      // Verificação de campos obrigatórios
      if (!title || !description || !client || !assignee || !status) {
        return NextResponse.json({ success: false, message: "Campos obrigatórios não preenchidos." }, { status: 400 })
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
      )
  
      // Resposta de sucesso
      return NextResponse.json({ success: true, message: "Tarefa atualizada com sucesso." })
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar tarefa." }, { status: 500 })
    }
  }
  

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    //   const user = checkPermission(req)
    //   if (!user) {
    //     return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
    //   }

    const taskId = params.id

    try {
        await db.execute(`DELETE FROM task_tags WHERE taskId = ?`, [taskId])
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
