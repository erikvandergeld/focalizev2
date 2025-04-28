import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import jwt from "jsonwebtoken"

// function checkPermission(req: NextRequest) {
//     const authHeader = req.headers.get("authorization")
//     const token = authHeader?.split(" ")[1]

//     if (!token) return null

//     try {
//         const decoded = jwt.verify(token, process.env.JWT_SECRET || "*default-secret*") as any
//         if (!decoded.permissions || !decoded.permissions.includes("acess_config")) return null
//         return decoded
//     } catch {
//         return null
//     }
// }

export async function POST(req: NextRequest) {
    // const decoded = checkPermission(req)
    // if (!decoded) {
    //     return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
    // }

    const { name, description, client, entity, status } = await req.json()

    if (!name || !client || !entity || !status) {
        return NextResponse.json({ success: false, message: "Dados incompletos." }, { status: 400 })
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

//GET para buscar todos os projetos
export async function GET(req: NextRequest) {
    // const user = checkPermission(req)
    // if (!user) {
    //   return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
    // }

    try {
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

        return NextResponse.json({ success: true, projetos: rows })
    } catch (error) {
        console.error("Erro ao buscar projetos:", error)
        return NextResponse.json({ success: false, message: "Erro ao buscar projetos" }, { status: 500 })
    }
}
