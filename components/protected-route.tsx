"use client"

import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "./auth-provider"
import { useEffect } from "react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading && !user && pathname !== "/login") {
      router.push("/login")
    }
  }, [user, isLoading, pathname, router])

  if (isLoading || (!user && pathname !== "/login")) {
    return <div className="p-4 text-center">Carregando...</div>
  }

  return <>{children}</>
}
