import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"  // Usando o pool de conexões
import { verifyToken } from "@/lib/auth-middleware"

// Função para garantir que as conexões sejam fechadas
async function safeQuery(query: string, values: any[]) {
  const connection = await db.getConnection()  // Obtém uma conexão do pool
  try {
    const [rows] = await connection.execute(query, values)  // Executa a consulta
    return rows
  } finally {
    connection.release()  // Libera a conexão para o pool
  }
}

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

// 🔒 POST - Criar cliente
export async function POST(req: NextRequest) {
  let decoded: any
  try {
    decoded = verifyToken(req)
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })
  }

  if (!decoded.permissions?.includes("manage_clients")) {
    return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })
  }

  try {
    const { id, name, email, phone, company, notes, entities } = await req.json()

    const createdAt = new Date()
    const query = `
      INSERT INTO clients (id, name, email, phone, company, notes, entities, createdAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    const values = [id, name, email, phone, company ?? null, notes, JSON.stringify(entities), createdAt]

    await safeQuery(query, values) // Usando safeQuery para garantir que a conexão seja fechada

    return NextResponse.json({ success: true, message: "Cliente cadastrado com sucesso." })
  } catch (error) {
    console.error("Erro ao cadastrar cliente:", error)
    return NextResponse.json({ success: false, message: "Erro ao cadastrar cliente." }, { status: 500 })
  }
}

// 🔒 GET - Listar clientes por entidade do usuário
export async function GET(req: NextRequest) {
  let decoded: any
  try {
    decoded = verifyToken(req)  // Verificação do token JWT
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Token inválido
  }

  const userEntities = decoded.entities || []  // Entidades do usuário logado

  if (!Array.isArray(userEntities) || userEntities.length === 0) {
    return NextResponse.json({ success: true, clientes: [] })  // Caso o usuário não tenha entidades, retorna uma lista vazia
  }

  try {
    // Buscar todos os clientes
    const query = "SELECT * FROM clients"
    const rows = await safeQuery(query, [])  // Usando a função safeQuery para garantir que a conexão seja fechada

    const clients = (rows as any[]).map((client) => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      notes: client.notes,
      entities: safeParse(client.entities),
      createdAt: client.createdAt,
    }))

    // Filtra os clientes que pertencem às entidades do usuário
    const filteredClients = clients.filter((client) =>
      client.entities.some((e: string) => userEntities.includes(e))
    )

    return NextResponse.json({ success: true, clientes: filteredClients })
  } catch (error) {
    console.error("Erro ao buscar clientes:", error)
    return NextResponse.json({ success: false, message: "Erro ao buscar clientes." }, { status: 500 })
  }
}
