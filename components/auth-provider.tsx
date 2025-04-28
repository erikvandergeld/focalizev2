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
        function sleep(ms: number) {
          return new Promise(function (resolve) {
            setTimeout(function () {
              resolve(true)
            }, ms)
          });
        }
        sleep(3000).then(() => {
          window.location.reload();  // Recarrega a página para resetar o estado
        });
      
       

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


  // Função de logout
  const logout = () => {
    setUser(null);  // Limpa o usuário do estado

    if (typeof window !== "undefined") {
      localStorage.removeItem("user");  // Remove o usuário do localStorage
      localStorage.removeItem("token"); // Remove o token do localStorage
    }
  }


  return <AuthContext.Provider value={{ user, login, logout, isLoading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
