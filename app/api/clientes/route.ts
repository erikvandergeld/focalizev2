import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

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


export async function POST(req: NextRequest) {
    try {
        const { id, name, email, phone, company, notes, entities } = await req.json()

        const createdAt = new Date()
        const query = "INSERT INTO clients (id, name, email, phone, company, notes, entities, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
        const values = [id, name, email, phone, company ?? null, notes, JSON.stringify(entities), createdAt]

        await db.execute(query, values)

        return NextResponse.json({ success: true, message: "Cliente cadastrado com sucesso." })
    } catch (error) {
        console.error("Erro ao cadastrar cliente:", error)
        return NextResponse.json({ success: false, message: "Erro ao cadastrar cliente." }, { status: 500 })
    }
}

export async function GET() {
    try {
        const [rows]: any = await db.query("SELECT * FROM clients")

        const clients = rows.map((client: any) => ({
            id: client.id,
            name: client.name,
            email: client.email,
            phone: client.phone,
            company: client.company,
            notes: client.notes,
            entities: safeParse(client.entities),
            createdAt: client.createdAt,
        }))


        return NextResponse.json({ success: true, clientes: clients }) // ✅ agora bate com o frontend
    } catch (error) {
        console.error("Erro ao buscar clientes:", error)
        return NextResponse.json({ success: false, message: "Erro ao buscar clientes." }, { status: 500 })
    }
}
