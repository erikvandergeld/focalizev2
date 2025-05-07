import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

// Função para garantir que as conexões sejam fechadas
async function safeQuery(query: string, values: any[] = []): Promise<any> {
  const connection = await db.getConnection();  // Obtém uma conexão do pool
  try {
    const [rows] = await connection.execute(query, values);  // Executa a consulta
    return rows;
  } finally {
    connection.release();  // Libera a conexão para o pool
  }
}

export async function POST(req: NextRequest) {
    try {
        const { id, name, color } = await req.json()

        const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

        // Usando safeQuery para garantir que a conexão seja fechada corretamente
        await safeQuery(
            "INSERT INTO tags (id, name, color, createdAt) VALUES (?, ?, ?, ?)",
            [id, name, color, createdAt]
        )

        const newTag = { id, name, color, createdAt }

        return NextResponse.json({ success: true, tag: newTag })
    } catch (error) {
        console.error("Erro ao criar tag:", error)
        return NextResponse.json({ success: false, message: "Erro ao criar tag" }, { status: 500 })
    }
}

export async function GET() {
    try {
        // Usando safeQuery para garantir que a conexão seja fechada corretamente
        const rows = await safeQuery("SELECT * FROM tags")

        return NextResponse.json({ success: true, tags: rows })
    } catch (error) {
        console.error("Erro ao buscar tags:", error)
        return NextResponse.json({ success: false, message: "Erro ao buscar tags" }, { status: 500 })
    }
}
