"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { loginUser, registerUser, getCurrentUser, removeToken } from "@/services/auth-service"
import type { User } from "@/types"

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => false,
  register: async () => false,
  logout: () => {},
})

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error("Erro ao carregar usuário:", error)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email: string, password: string) => {
    try {
      const response = await loginUser(email, password)
      setUser(response.user)
      return true
    } catch (error) {
      console.error("Erro de login:", error)
      return false
    }
  }

  const register = async (name: string, email: string, password: string) => {
    try {
      // Registrar o usuário
      await registerUser({
        username: email.split("@")[0],
        email,
        password,
        full_name: name,
      })

      // Fazer login automaticamente após o registro
      const loginResponse = await loginUser(email, password)
      setUser(loginResponse.user)
      return true
    } catch (error) {
      console.error("Erro de registro:", error)
      return false
    }
  }

  const logout = () => {
    removeToken()
    setUser(null)
    router.push("/login")
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
