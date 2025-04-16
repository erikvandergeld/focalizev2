import { NextRequest, NextResponse } from "next/server"
import db from "@/lib/db"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"

function safeParse(value: any) {
  if (typeof value === "string") {
    try {
      return JSON.parse(value)
    } catch {
      return []
    }
  }
}

export async function POST(req: NextRequest) {
  const { email, password } = await req.json()

  try {
    const [rows]: any = await db.execute("SELECT * FROM users WHERE email = ?", [email])
    console.log("Resultado rows:", rows)


    if (rows.length !== 1) {
      return NextResponse.json({ success: false, message: "Credenciais inválidas" }, { status: 401 })
    }

    const user = rows[0]

    const passwordMatch = await bcrypt.compare(password, user.senha)
    if (!passwordMatch) {
      return NextResponse.json({ success: false, message: "Credenciais inválidas" }, { status: 401 })
    }

    const token = jwt.sign(
      {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        permissions: user.permissions || [], // ✅ aqui também
      },
      process.env.JWT_SECRET!,
      { expiresIn: "1h" }
    )


    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        isAdmin: user.tipo === "comum",
        disabled: false,
        permissions: user.permissions || [], // ✅ aqui
      },
    })


  } catch (error) {
    console.error("Erro ao acessar o banco:", error)
    return NextResponse.json({ success: false, message: "Erro interno" }, { status: 500 })
  }
}
