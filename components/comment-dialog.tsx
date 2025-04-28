"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { formatDistanceToNow } from "date-fns"
import { ptBR } from "date-fns/locale"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useNotifications } from "./notification-provider"

export type Comment = {
  id: string
  text: string
  author: string
  createdAt: Date
}

// const onAddComment = async (taskId: string, commentText: string) => {
//   const token = localStorage.getItem("token");
//   const headers = {
//     "Content-Type": "application/json",
//     Authorization: `Bearer ${token}`,
//   };

//   try {
//     // Enviar o comentário para o backend
//     const response = await fetch(`/api/tarefas/${taskId}/comentarios`, {
//       method: "POST",
//       headers,
//       body: JSON.stringify({ text: commentText }),
//     });

//     const data = await response.json();

//     if (!response.ok || !data.success) {
//       throw new Error(data.message || "Erro ao adicionar comentário.");
//     }

//     return true;
//   } catch (error) {
//     console.error("Erro ao adicionar comentário:", error);
//     throw error;
//   }
// };


interface CommentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  taskId: string
  taskTitle: string
  client: string
  comments: Comment[]
  onAddComment: (taskId: string, comment: string) => void
}

export function CommentDialog({
  open,
  onOpenChange,
  taskId,
  taskTitle,
  client,
  comments,
  onAddComment,
}: CommentDialogProps) {
  const [newComment, setNewComment] = useState("");
  const { addNotification } = useNotifications()

  const handleSubmit = async () => {
    if (newComment.trim()) {
      try {
        // Enviar o comentário para o backend
        await onAddComment(taskId, newComment); // Chama a função onAddComment, passando o novo comentário
        
        // Limpar o campo de texto após enviar
        setNewComment("");

        // Notificar o usuário
        addNotification(
          "Comentário adicionado",
          `Você adicionou um comentário à tarefa "${taskTitle}" para o cliente ${client}.`
        );

        // Atualizar a lista de comentários localmente
        onOpenChange(true);  // Atualiza o estado e força a re-renderização do Dialog
      } catch (error) {
        console.error("Erro ao adicionar comentário:", error);
        addNotification("Erro ao adicionar comentário", "Não foi possível adicionar o comentário.");
      }
    }
  };
  
  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR })
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Comentários</DialogTitle>
          <DialogDescription>
            Tarefa: {taskTitle} - Cliente: {client}
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <ScrollArea className="h-[300px] pr-4">
            {comments.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">
                Nenhum comentário ainda. Seja o primeiro a comentar!
              </p>
            ) : (
              <div className="space-y-4">
                {comments.map((comment) => (
                  <div key={comment.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs">
                        {comment.author
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{comment.author}</p>
                        <span className="text-xs text-muted-foreground">
                          {formatDate(comment.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>

        <div className="space-y-2">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!newComment.trim()}>
            Adicionar comentário
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}