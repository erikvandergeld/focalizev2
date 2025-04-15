import { RegisterForm } from "@/components/register-form"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Criar conta</h1>
            <p className="text-muted-foreground">Preencha os dados abaixo para criar sua conta</p>
          </div>
          <RegisterForm />
          <div className="text-center text-sm">
            Já tem uma conta?{" "}
            <Link href="/login" className="underline">
              Faça login
            </Link>
          </div>
          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Voltar para a página inicial
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
