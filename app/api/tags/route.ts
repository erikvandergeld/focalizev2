import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"

export async function POST(req: NextRequest) {
    try {
        const { id, name, color } = await req.json()

        const createdAt = new Date().toISOString().slice(0, 19).replace("T", " ")

        await db.execute(
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
        const [rows]: any = await db.query("SELECT * FROM tags")

        return NextResponse.json({ success: true, tags: rows })
    } catch (error) {
        console.error("Erro ao buscar tags:", error)
        return NextResponse.json({ success: false, message: "Erro ao buscar tags" }, { status: 500 })
    }
}
