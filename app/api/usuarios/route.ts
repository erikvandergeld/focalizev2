import { NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"  // Importando a função verifyToken

// Função para garantir a segurança e parse de valores
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

// Função segura para execução de consultas com liberação da conexão
async function safeQuery(query: string, values: any[]) {
    const connection = await db.getConnection();  // Obtém uma conexão do pool
    try {
        const [result]: any = await connection.execute(query, values);  // Executa a consulta
        return result;
    } finally {
        connection.release();  // Libera a conexão para o pool
    }
}

export async function GET(req: Request) {
    let decoded: any

    try {
        // Verifica o token e decodifica
        decoded = verifyToken(req)
    } catch (err: any) {
        // Se o token for inválido ou a verificação falhar
        return NextResponse.json({ success: false, message: err.message }, { status: 401 })
    }

    // Verificar se o usuário tem permissão para visualizar os usuários
    if (!decoded.permissions?.includes("acess_config")) {
        return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })
    }

    try {
        // Utilizando a função segura para consultar usuários
        const rows = await safeQuery("SELECT * FROM users", [])

        const usuarios = rows.map((user: any) => ({
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            entities: safeParse(user.entities),
            permissions: safeParse(user.permissions),
            createdAt: user.createdAt,
        }))

        return NextResponse.json({ success: true, usuarios })
    } catch (error) {
        console.error("Erro ao buscar usuários:", error)  // ← importante para debugar
        return NextResponse.json({ success: false, message: "Erro ao buscar usuários" }, { status: 500 })
    }
}
