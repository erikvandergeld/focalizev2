"use client"

import { useEffect } from "react"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider as RadixToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"
import { useToast } from "@/components/ui/use-toast"

export function Toaster() {
  const { toasts, toast } = useToast()

  // Compatibilidade com chamadas de `toast()` fora de context
  useEffect(() => {
    const handler = (e: any) => toast(e.detail)
    window.addEventListener("trigger-toast", handler)
    return () => window.removeEventListener("trigger-toast", handler)
  }, [toast])

  return (
    <RadixToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => (
        <Toast key={id} {...props}>
          <div className="grid gap-1">
            {title && <ToastTitle>{title}</ToastTitle>}
            {description && <ToastDescription>{description}</ToastDescription>}
          </div>
          {action}
          <ToastClose />
        </Toast>
      ))}
      <ToastViewport />
    </RadixToastProvider>
  )
}
