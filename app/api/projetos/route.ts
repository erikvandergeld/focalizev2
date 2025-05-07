import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import { verifyToken } from "@/lib/auth-middleware"  // Importa o middleware para verificar o token JWT

// 🔒 POST - Criar projeto
export async function POST(req: NextRequest) {
    let decoded: any
    try {
        decoded = verifyToken(req)  // Verificação do token JWT
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Token inválido
    }

    if (!decoded.permissions?.includes("create_task")) {
        return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })  // Permissão negada
    }

    const { name, description, client, entity, status } = await req.json()

    // Verificar se todos os dados obrigatórios foram enviados
    if (!name || !client || !entity || !status) {
        return NextResponse.json({ success: false, message: "Dados incompletos." }, { status: 400 })
    }

    // Verificar se a entidade pertence ao usuário (somente entidades associadas ao usuário podem ser usadas)
    if (!decoded.entities.includes(entity)) {
        return NextResponse.json({ success: false, message: "Você não tem permissão para criar projetos nesta entidade." }, { status: 403 })
    }

    const id = `project-${Date.now()}`
    const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

    try {
        await db.execute(
            "INSERT INTO projects (id, name, description, client, entity, status, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [id, name, description, client, entity, status, createdAt]
        )

        return NextResponse.json({ success: true, message: "Projeto criado com sucesso", id })
    } catch (error) {
        console.error("Erro ao criar projeto:", error)
        return NextResponse.json({ success: false, message: "Erro ao criar projeto" }, { status: 500 })
    }
}

// 🔒 GET - Listar projetos
export async function GET(req: NextRequest) {
    let decoded: any
    try {
        decoded = verifyToken(req)  // Verificação do token JWT
    } catch (err: any) {
        return NextResponse.json({ success: false, message: err.message }, { status: 401 })  // Token inválido
    }

    // Garantir que o usuário tenha a permissão de "create_task"
    if (!decoded.permissions?.includes("create_task")) {
        return NextResponse.json({ success: false, message: "Permissão negada." }, { status: 403 })  // Permissão negada
    }

    try {
        // Buscar todos os projetos, incluindo os dados de cliente e entidade
        const [rows]: any = await db.query(`
            SELECT 
                p.id,
                p.name,
                p.description,
                p.status,
                c.name AS client,               -- nome do cliente
                p.entity,                        -- id da entidade
                e.name AS entity_name,           -- nome amigável da entidade
                p.createdAt
            FROM projects p
            LEFT JOIN clients c ON p.client = c.id
            LEFT JOIN entities e ON p.entity = e.id
            ORDER BY p.createdAt DESC
        `)

        // Filtrando os projetos para garantir que o usuário só veja projetos das entidades a que ele tem acesso
        const filteredProjects = rows.filter((project: any) =>
            decoded.entities.includes(project.entity)  // Só mostrar projetos de entidades do usuário
        )

        return NextResponse.json({ success: true, projetos: filteredProjects })
    } catch (error) {
        console.error("Erro ao buscar projetos:", error)
        return NextResponse.json({ success: false, message: "Erro ao buscar projetos" }, { status: 500 })
    }
}
