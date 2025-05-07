"use client"

import * as React from "react"
import type { ToastActionElement, ToastProps } from "@/components/ui/toast"

const TOAST_LIMIT = 5
const TOAST_REMOVE_DELAY = 1000

type ToasterToast = ToastProps & {
  id: string
  title?: React.ReactNode
  description?: React.ReactNode
  action?: ToastActionElement
}

type Toast = Omit<ToasterToast, "id">

type ToastContextType = {
  toasts: ToasterToast[]
  toast: (props: Toast) => { id: string }
  dismiss: (toastId?: string) => void
}

const ToastContext = React.createContext<ToastContextType | undefined>(undefined)

let toastIdCounter = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToasterToast[]>([])

  const toast = (props: Toast) => {
    const id = (++toastIdCounter).toString()

    const newToast: ToasterToast = {
      ...props,
      id,
      open: true,
      onOpenChange: (open) => {
        if (!open) dismiss(id)
      },
    }

    setToasts((prev) => [newToast, ...prev].slice(0, TOAST_LIMIT))

    return { id }
  }

  const dismiss = (toastId?: string) => {
    setToasts((prev) =>
      prev.map((t) =>
        !toastId || t.id === toastId ? { ...t, open: false } : t
      )
    )

    setTimeout(() => {
      setToasts((prev) =>
        !toastId ? [] : prev.filter((t) => t.id !== toastId)
      )
    }, TOAST_REMOVE_DELAY)
  }

  return (
    <ToastContext.Provider value={{ toasts, toast, dismiss }}>
      {children}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = React.useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider")
  }
  return context
}

export const toast = (props: Toast) => {
  // fallback para compatibilidade externa
  if (typeof window !== "undefined") {
    const event = new CustomEvent("trigger-toast", { detail: props })
    window.dispatchEvent(event)
  }
}
