"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "./auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

export function LoginForm() {
  const [identifier, setIdentifier] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const success = await login(identifier, password)

      if (success) {
        toast({
          title: "Login realizado com sucesso",
          description: "Você será redirecionado para o dashboard.",
        })

        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        toast({
          title: "Erro ao fazer login",
          description: "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erro inesperado",
        description: "Não foi possível processar sua solicitação.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="identifier">Nome de usuário ou Email</Label>
        <Input
          id="identifier"
          type="text"
          placeholder="Digite seu e-mail"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <Input
          id="password"
          type="password"
          placeholder="Digite sua senha"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <div className="flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Entrando...
          </div>
        ) : (
          "Entrar"
        )}
      </Button>
    </form>
  )
}
