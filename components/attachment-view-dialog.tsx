// Dialog para visualizar anexos da tarefa
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Task } from "@/components/kanban-board"


export function AttachmentViewDialog({
  open,
  onOpenChange,
  task,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
}) {
  if (!task) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Anexos da tarefa: {task.title}</DialogTitle>
          <DialogDescription>Arquivos enviados para esta tarefa.</DialogDescription>
        </DialogHeader>

        {task.attachments && task.attachments.length > 0 ? (
          <div className="space-y-3 mt-4">
            {task.attachments.map((attachment: any) => (
              <div key={attachment.id} className="flex items-center justify-between">
                <a
                  href={attachment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline flex items-center gap-2"
                >
                  <Paperclip className="h-4 w-4" /> {attachment.name}
                </a>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(attachment.url, "_blank")}
                >
                  Baixar
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground mt-4">Nenhum anexo encontrado para esta tarefa.</p>
        )}
      </DialogContent>
    </Dialog>
  );
}
