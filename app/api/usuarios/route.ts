// app/api/usuarios/route.ts
import { NextResponse } from "next/server"
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


export async function GET() {
    try {
        const [rows]: any = await db.query("SELECT * FROM users")

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
        console.error("Erro ao buscar usuários:", error) // ← isso é importante
        return NextResponse.json({ success: false, message: "Erro ao buscar usuários" }, { status: 500 })
    }
}
