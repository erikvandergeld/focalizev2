import { LoginForm } from "@/components/login-form"
import { CheckSquareIcon } from "lucide-react"

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
        <div className="mx-auto w-full max-w-sm space-y-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex items-center gap-2">
              <CheckSquareIcon className="h-8 w-8 text-white" />
              <h1 className="text-3xl font-bold">Focalize</h1>
            </div>
            <p className="text-muted-foreground text-center">Entre com sua conta para acessar o sistema</p>
          </div>
          <LoginForm />
          <footer className="absolute bottom-4 left-0 right-0 text-center text-sm text-muted-foreground">
            Desenvolvido pelo time da Ingline Systems
          </footer>
        </div>
      </div>
    </div>
  )
}
