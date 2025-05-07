import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { AuthProvider } from "@/components/auth-provider"
import { NotificationProvider } from "@/components/notification-provider"
import { ToastProvider } from "@/components/ui/use-toast"


const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Focalize - Sistema de Gestão de Tarefas",
  description: "Gerencie suas tarefas e projetos de forma eficiente com Focalize da Ingline Systems",
  generator: 'Ingline Systems'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body className={inter.className}>
        <ToastProvider>  {/* Adiciona o ToastProvider aqui */}
          <AuthProvider>
            <NotificationProvider>
              <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
                {children}
                <Toaster />
              </ThemeProvider>
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  )
}

import './globals.css'
