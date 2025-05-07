import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"

function safeParse(value: any) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }

  if (Buffer.isBuffer(value)) {
    try {
      return JSON.parse(value.toString("utf8"))
    } catch {
      return []
    }
  }

  return Array.isArray(value) ? value : []
}

// Função para garantir que as conexões sejam fechadas
async function safeQuery(query: string, values: any[]) {
  const connection = await db.getConnection()  // Obtém uma conexão do pool
  try {
    const [rows]: any = await connection.execute(query, values)  // Executa a consulta
    return rows
  } finally {
    connection.release()  // Libera a conexão para o pool
  }
}

// 🔒 GET: buscar cliente (visível se pertence a entidade do usuário)
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const clientId = params.id

  let decoded: any
  try {
    decoded = verifyToken(request)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  try {
    const rows = await safeQuery("SELECT * FROM clients WHERE id = ?", [clientId])

    if (!rows || rows.length === 0) {
      return NextResponse.json({ success: false, message: "Cliente não encontrado" }, { status: 404 })
    }

    const client = rows[0]
    client.entities = safeParse(client.entities)

    // Verifica se o cliente pertence a uma das entidades do usuário
    const userEntities = decoded.entities || []
    const allowed = client.entities.some((e: string) => userEntities.includes(e))

    if (!allowed) {
      return NextResponse.json({ success: false, message: "Acesso negado ao cliente" }, { status: 403 })
    }

    return NextResponse.json({ success: true, client })
  } catch (error) {
    console.error("Erro ao buscar cliente:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar cliente" }, { status: 500 })
  }
}

// 🔒 DELETE: remover cliente
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any
  try {
    decoded = verifyToken(req)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  if (!decoded.permissions?.includes("manage_clients")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })
  }

  const clientId = params.id

  try {
    const result = await safeQuery("DELETE FROM clients WHERE id = ?", [clientId])

    // A consulta DELETE não retorna um array de resultados, mas sim um objeto de resultado
    const affectedRows = result.affectedRows // Acesso a propriedade dentro do objeto

    if (affectedRows === 0) {
      return NextResponse.json({ success: false, message: "Cliente não encontrado" }, { status: 404 })
    }

    return NextResponse.json({ success: true, message: "Cliente removido com sucesso" })
  } catch (error) {
    console.error("Erro ao deletar cliente:", error)
    return NextResponse.json({ success: false, message: "Erro ao deletar cliente" }, { status: 500 })
  }
}

// 🔒 PUT: atualizar cliente
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  let decoded: any
  try {
    decoded = verifyToken(req)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  if (!decoded.permissions?.includes("manage_clients")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })
  }

  const clientId = params.id
  const { name, email, phone, company, notes, entities } = await req.json()

  try {
    await safeQuery(
      "UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, notes = ?, entities = ? WHERE id = ?",
      [name, email, phone, company, notes, JSON.stringify(entities), clientId]
    )

    return NextResponse.json({ success: true, message: "Cliente atualizado com sucesso" })
  } catch (error) {
    console.error("Erro ao atualizar cliente:", error)
    return NextResponse.json({ success: false, message: "Erro ao atualizar cliente" }, { status: 500 })
  }
}
