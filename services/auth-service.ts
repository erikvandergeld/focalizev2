import type { User } from "@/types"
import { api } from "./api-service"

export interface LoginResponse {
  message: string
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
    // Special case for admin user
    if (email.toUpperCase() === "ADMIN" && password === "*Ingline.Sys#9420%") {
      // Check if admin is disabled in localStorage
      if (typeof window !== "undefined" && localStorage.getItem("adminDisabled") === "true") {
        throw new Error("Usuário administrador desativado")
      }

      // Create a simulated admin response
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

      // Store token in localStorage
      localStorage.setItem("token", adminResponse.token)
      return adminResponse
    }

    // Regular API login
    const response = await api.post<LoginResponse>("/auth/login", { email, password }, { token: false })

    // Store token in localStorage
    if (response.token) {
      localStorage.setItem("token", response.token)
    }

    return response
  } catch (error: any) {
    throw new Error(error.message || "Erro ao fazer login")
  }
}

export async function registerUser(userData: RegisterData): Promise<{ message: string; userId: number }> {
  try {
    return await api.post("/auth/register", userData, { token: false })
  } catch (error: any) {
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
}

export async function getCurrentUser(): Promise<User | null> {
  const token = getToken()

  if (!token) return null

  // Special case for admin token
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
    return await api.get("/users/me")
  } catch (error) {
    console.error("Error fetching current user:", error)
    removeToken()
    return null
  }
}
