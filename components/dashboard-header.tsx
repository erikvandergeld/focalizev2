import type React from "react"
interface DashboardHeaderProps {
  heading: string
  text?: string
  children?: React.ReactNode
}

export function DashboardHeader({ heading, text, children }: DashboardHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold">{heading}</h1>
        {text && <p className="text-sm text-muted-foreground">{text}</p>}
      </div>
      {children}
    </div>
  )
}
