"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useState } from "react"

interface AttachmentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpload: (file: File) => void
}

export function AttachmentDialog({ open, onOpenChange, onUpload }: AttachmentDialogProps) {
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = () => {
    if (file) {
      onUpload(file)
      onOpenChange(false)
      setFile(null)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar anexo</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button disabled={!file} onClick={handleSubmit}>
              Enviar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
