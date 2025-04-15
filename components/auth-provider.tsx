"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"

type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
  disabled: boolean
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
      if (storedUser) {
        setUser(JSON.parse(storedUser))
      }
      setIsLoading(false)
    }
  }, [])

  const login = async (email: string, password: string) => {
    // Set loading state
    setIsLoading(true)

    // Check for the default admin user
    if (email === "ADMIN" && password === "*Ingline.Sys#9420%") {
      // Check if admin is disabled
      const adminDisabled = typeof window !== "undefined" ? localStorage.getItem("adminDisabled") === "true" : false

      if (adminDisabled) {
        setIsLoading(false)
        return false
      }

      // Create admin user
      const adminUser = {
        id: "admin-user",
        name: "Administrator",
        email: "ADMIN",
        isAdmin: true,
        disabled: false,
      }

      setUser(adminUser)
      if (typeof window !== "undefined") {
        localStorage.setItem("user", JSON.stringify(adminUser))
      }
      setIsLoading(false)
      return true
    }

    // In a real scenario, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // No other users exist in the initial deployment
    setIsLoading(false)
    return false
  }

  const register = async (name: string, email: string, password: string) => {
    // Simulation of register
    setIsLoading(true)

    // In a real scenario, this would be an API call
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Create a new user (not admin by default)
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

  const logout = () => {
    setUser(null)
    if (typeof window !== "undefined") {
      localStorage.removeItem("user")
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
