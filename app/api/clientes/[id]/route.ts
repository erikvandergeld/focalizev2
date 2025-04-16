// app/api/clientes/[id]/route.ts
import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import jwt from "jsonwebtoken"

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


export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    const clientId = params.id
    try {
      const [rows]: any = await db.query("SELECT * FROM clients WHERE id = ?", [clientId])
  
      if (!rows || rows.length === 0) {
        return NextResponse.json({ success: false, message: "Cliente não encontrado" }, { status: 404 })
      }
  
      const client = rows[0]
      client.entities = safeParse(client.entities)
  
      return NextResponse.json({ success: true, client })
    } catch (error) {
      console.error("Erro ao buscar cliente:", error)
      return NextResponse.json({ success: false, message: "Erro ao buscar cliente" }, { status: 500 })
    }
  }
  
  // Reutiliza a função de validação
  async function checkPermission(req: NextRequest): Promise<{ authorized: boolean; decoded?: any }> {
    const authHeader = req.headers.get("authorization")
    const token = authHeader?.split(" ")[1]
  
    if (!token) return { authorized: false }
  
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "*Ingline.Sys#9420%") as any
  
      if (!decoded.permissions || !decoded.permissions.includes("acess_config")) {
        return { authorized: false }
      }
  
      return { authorized: true, decoded }
    } catch {
      return { authorized: false }
    }
  }
  
  // DELETE CLIENTE
  export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
    const permissionCheck = await checkPermission(req)
    if (!permissionCheck.authorized) {
      return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
    }
  
    const clientId = params.id
  
    try {
      const [result]: any = await db.execute("DELETE FROM clients WHERE id = ?", [clientId])
  
      if (result.affectedRows === 0) {
        return NextResponse.json({ success: false, message: "Cliente não encontrado" }, { status: 404 })
      }
  
      return NextResponse.json({ success: true, message: "Cliente removido com sucesso" })
    } catch (error) {
      console.error("Erro ao deletar cliente:", error)
      return NextResponse.json({ success: false, message: "Erro ao deletar cliente" }, { status: 500 })
    }
  }
  
  // PUT CLIENTE
  export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
    const permissionCheck = await checkPermission(req)
    if (!permissionCheck.authorized) {
      return NextResponse.json({ success: false, message: "Acesso negado." }, { status: 403 })
    }
  
    const clientId = params.id
    const { name, email, phone, company, notes, entities } = await req.json()
  
    try {
      await db.execute(
        "UPDATE clients SET name = ?, email = ?, phone = ?, company = ?, notes = ?, entities = ? WHERE id = ?",
        [name, email, phone, company, notes, JSON.stringify(entities), clientId]
      )
  
      return NextResponse.json({ success: true, message: "Cliente atualizado com sucesso" })
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error)
      return NextResponse.json({ success: false, message: "Erro ao atualizar cliente" }, { status: 500 })
    }
  }
  