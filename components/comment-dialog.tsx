import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useNotifications } from "./notification-provider";
import { toast } from "sonner";
import { User } from "lucide-react";
import { useAuth } from "./auth-provider";


// Regex para detectar menções no formato "@usuario"
const mentionRegex = /@([a-zA-Z0-9_]+)/g;

// types.ts

export type UserType = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  entities: string[];
  permissions: string[];
  createdAt: string;
};

export type Comment = {
  id: string;
  text: string;
  author: string;
  createdAt: Date;
};

interface CommentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskId: string;
  taskTitle: string;
  client: string;
  comments: Comment[];
  onAddComment: (taskId: string, comment: string, mentions: string[]) => void;
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
  const [mentions, setMentions] = useState<string[]>([]);
  const [showMentionList, setShowMentionList] = useState(false);
  const [users, setUsers] = useState<UserType[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserType[]>([]);
  const { addNotification } = useNotifications();
  const { user: $user } = useAuth();

  // Função para buscar usuários diretamente da API do Focalize
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Usuário não autenticado.");
        return;
      }

      const response = await fetch("/api/usuarios", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUsers(data.usuarios || []);
      } else {
        toast.error("Erro ao buscar usuários.");
      }
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao se conectar com o servidor.");
    }
  };

  useEffect(() => {
    if (open) {
      fetchUsers();
    }
  }, [open]);

  // Função para capturar menções no texto
  const extractMentions = (text: string) => {
    const matches = text.match(mentionRegex);
    return matches ? matches.map((match) => match.substring(1)) : [];
  };

  // Função para lidar com a inserção de menção
  const handleMentionSelect = (user: { id: string; firstName: string; lastName: string }) => {
    const textArray = newComment.split(" ");
    textArray.pop(); // Remove o texto parcial da menção
    setNewComment(`${textArray.join(" ")} @${user.firstName} ${user.lastName} `);
    setShowMentionList(false);
    setFilteredUsers([]);
  };

  // Função para lidar com a mudança de texto e exibir a lista de menções
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setNewComment(text);
    const mentionsInText = extractMentions(text);
    setMentions(mentionsInText);

    const lastWord = text.split(" ").pop();
    if (lastWord?.startsWith("@")) {
      setShowMentionList(true);
      const query = lastWord.substring(1).toLowerCase();
      setFilteredUsers(
        users.filter((user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(query)
        )
      );
    } else {
      setShowMentionList(false);
      setFilteredUsers([]);
    }
  };

// Atualizando a assinatura da função onAddComment
const handleSubmit = async () => {
  if (newComment.trim()) {
    try {
      const extractedMentions = extractMentions(newComment).map((mention) =>
        mention.replace("@", "").trim()
      );

      const mentionedUserIds = users
        .filter((user) =>
          extractedMentions.some(
            (mention) =>
              mention.toLowerCase() === user.firstName.toLowerCase() ||
              mention.toLowerCase() === `${user.firstName.toLowerCase()} ${user.lastName.toLowerCase()}`
          )
        )
        .map((user) => user.id);

      // Chama a função centralizada handleAddComment com os dados necessários
      // A função onAddComment foi definida para receber 3 parâmetros
      await onAddComment(taskId, newComment, mentionedUserIds);

      setNewComment("");
      setMentions([]);
      addNotification(
        "Comentário adicionado",
        `Comentário adicionado à tarefa "${taskTitle}".`
      );
      toast.success("Comentário adicionado com sucesso!");
      onOpenChange(true);
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      addNotification("Erro ao adicionar comentário", "Não foi possível adicionar o comentário.");
    }
  }
};

  const formatDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true, locale: ptBR });
  };

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
              comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {comment.author[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium">{comment.author}</p>
                    <p className="text-sm">{comment.text}</p>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                </div>
              ))
            )}
          </ScrollArea>
        </div>

        <div className="relative space-y-2">
          <Textarea
            placeholder="Adicione um comentário..."
            value={newComment}
            onChange={handleCommentChange}
            className="min-h-[80px]"
          />

          {showMentionList && (
            <div className="absolute bg-[#161B22] border border-gray-600 rounded-md shadow-md max-h-40 overflow-y-auto z-10 w-full mt-1">
              {filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center px-3 py-2 cursor-pointer hover:bg-[#0D1117] transition text-white"
                  onClick={() => handleMentionSelect(user)}
                >
                  <span className="font-medium">{user.firstName} {user.lastName}</span>
                </div>
              ))}
            </div>
          )}
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
