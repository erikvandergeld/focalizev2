// lib/auth-middleware.ts
import jwt from "jsonwebtoken"

export function verifyToken(req: Request): { id: string, email: string, permissions: string[], entities: string[] } {
  const authHeader = req.headers.get("authorization")
  const token = authHeader?.split(" ")[1]

  if (!token) {
    throw new Error("Token não fornecido")
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "*Ingline.Sys#9420%")
    return decoded as any
  } catch {
    throw new Error("Token inválido")
  }
}
