import type { User } from "@/types"
import { api } from "./api-service"

export interface LoginResponse {
  message?: string
  user: User
  token: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  full_name: string
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  try {
    // Caso especial para usuário admin
    if (email.toUpperCase() === "ADMIN" && password === "*Ingline.Sys#9420%") {
      if (typeof window !== "undefined" && localStorage.getItem("adminDisabled") === "true") {
        throw new Error("Usuário administrador desativado")
      }

      const adminResponse: LoginResponse = {
        message: "Login realizado com sucesso",
        user: {
          id: 1,
          username: "admin",
          email: "admin@focalize.com",
          full_name: "Administrador",
          role: "admin",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
        },
        token: "admin-token-simulated",
      }

      localStorage.setItem("token", adminResponse.token)
      localStorage.setItem("user", JSON.stringify(adminResponse.user))
      return adminResponse
    }

    // Login normal via API
    const response = await api.post<LoginResponse>("/auth/login", { email, password }, { token: false })

    if (response.token) {
      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))
    }

    return response
  } catch (error: any) {
    console.error("Erro de login:", error)
    throw new Error(error.message || "Erro ao fazer login")
  }
}

export async function registerUser(userData: RegisterData): Promise<{ message: string; userId: number }> {
  try {
    return await api.post("/auth/register", userData, { token: false })
  } catch (error: any) {
    console.error("Erro de registro:", error)
    throw new Error(error.message || "Erro ao registrar usuário")
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null
  return localStorage.getItem("token")
}

export function removeToken(): void {
  if (typeof window === "undefined") return
  localStorage.removeItem("token")
  localStorage.removeItem("user")
}

export async function getCurrentUser(): Promise<User | null> {
  // Primeiro, tente obter do localStorage para evitar chamadas desnecessárias
  if (typeof window !== "undefined") {
    const userJson = localStorage.getItem("user")
    if (userJson) {
      try {
        return JSON.parse(userJson)
      } catch (e) {
        // Se houver erro ao fazer parse, continue para buscar da API
      }
    }
  }

  const token = getToken()
  if (!token) return null

  // Caso especial para token de admin
  if (token === "admin-token-simulated") {
    return {
      id: 1,
      username: "admin",
      email: "admin@focalize.com",
      full_name: "Administrador",
      role: "admin",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true,
    }
  }

  try {
    const user = await api.get<User>("/users/me")
    // Atualizar o localStorage com os dados mais recentes
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(user))
    }
    return user
  } catch (error) {
    console.error("Erro ao buscar usuário atual:", error)
    removeToken()
    return null
  }
}
