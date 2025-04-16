"use client"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  disabled: boolean
  permissions: string[]  // ✅ adiciona aqui
}


type AuthContextType = {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  register: (name: string, email: string, password: string) => Promise<boolean>
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Verificar se o usuário está logado ao carregar a página
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user")
      const token = localStorage.getItem("token")
      if (storedUser && token) {
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }
  }, [])

  // Função de login
  const login = async (email: string, password: string) => {
    setIsLoading(true)
  
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      })
  
      const data = await response.json()

      if (response.ok && data.success) {

        const loggedUser = {
          id: data.user.id,
          name: data.user.name,
          email: data.user.email,
          isAdmin: data.user.isAdmin,
          disabled: data.user.disabled,
          permissions: data.user.permissions || [],
        }
  
        const token = data.token
  
        setUser(loggedUser)
        localStorage.setItem("user", JSON.stringify(loggedUser))
        localStorage.setItem("token", token)
        setIsLoading(false)
        return true
      } else {
        setIsLoading(false)
        return false
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error)
      setIsLoading(false)
      return false
    }
  }
  

  // Função de registro
  const register = async (name: string, email: string, password: string) => {
    // Simulação de registro (pode ser substituído por uma chamada real à API)
    setIsLoading(true)

    await new Promise((resolve) => setTimeout(resolve, 1000))

    const newUser = {
      id: `user-${Date.now()}`,
      name,
      email,
      isAdmin: false,
      disabled: false,
    }

    setUser(newUser)
    if (typeof window !== "undefined") {
      localStorage.setItem("user", JSON.stringify(newUser))
    }
    setIsLoading(false)
    return true
  }

  // Função de logout
  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
      localStorage.removeItem("token") // Remover o JWT no logout
    }
   }

  return <AuthContext.Provider value={{ user, login, register, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
