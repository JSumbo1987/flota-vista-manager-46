import { useNavigate } from "react-router-dom";
import { X, Bell } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { supabase } from "@/lib/supabaseClient";
import getRelativeTime from "./RelativeTime";

interface NotificationsDropdownProps {
  onClose: () => void;
}

interface NotificationItemProps {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "warning" | "info" | "success" | "error";
  route: string;
  onClick: () => void;
}

const getTypeStyles = (type: string) => {
  switch (type) {
    case "warning":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "error":
      return "bg-red-100 text-red-800 border-red-200";
    case "success":
      return "bg-green-100 text-green-800 border-green-200";
    case "info":
    default:
      return "bg-blue-100 text-blue-800 border-blue-200";
  }
};

const NotificationItem = ({
  id,
  title,
  description,
  time,
  read,
  type,
  onClick,
}: NotificationItemProps) => {
  return (
    <div
      className={cn(
        "p-3 border-l-4 hover:bg-muted/50 cursor-pointer",
        getTypeStyles(type),
        !read && "bg-muted/20"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium">{title}</h4>
        <span className="text-xs text-muted-foreground">{time}</span>
      </div>
      <p className="text-xs mt-1">{description}</p>
    </div>
  );
};

const NotificationsDropdown = ({ onClose }: NotificationsDropdownProps) => {
  const navigate = useNavigate();

  // Usando só o hook customizado para pegar notificações
  const { notifications, loading, error } = useNotifications();

  

  // Mapeia as notificações para o formato esperado pelo NotificationItem
  const mappedNotifications = notifications.map((item) => ({
    id: item.id,
    title: item.titulo || "Sem título",
    description: item.descricao || "",
    time: item.created_at
      ? getRelativeTime(item.created_at)//Este é um hook para mostrar "há 1 minuto, há 1 hora etc."
      : "",
    read: item.lido || false,
    type: (item.tipo as any) || "info",
    route: item.rota || "/",
    onClick: async () => {
      // Marcar como lida no Supabase
      const { error } = await supabase
        .from("tblnotificacoes")
        .update({ lido: true })
        .eq("id", item.id);
    
      if (!error) {
        onClose(); // Fecha o dropdown
        navigate(item.rota || "/"); // Redireciona
      }
    }
    
  }));

  return (
    <div className="absolute right-0 mt-2 w-80 bg-card rounded-md shadow-lg z-50 border">
      <div className="p-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <h3 className="font-medium">Notificações</h3>
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {mappedNotifications.filter((n) => !n.read).length}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-0">
          {loading ? (
            <p className="p-3 text-center">Carregando notificações...</p>
          ) : error ? (
            <p className="p-3 text-center text-red-600">
              Erro: {error}
            </p>
          ) : mappedNotifications.length === 0 ? (
            <p className="p-3 text-center text-muted-foreground">
              Nenhuma notificação
            </p>
          ) : (
            mappedNotifications.map((notification) => (
              <NotificationItem key={notification.id} {...notification} />
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />
      <div className="p-2 text-center">
        <Button
          variant="link"
          className="text-xs"
          onClick={() => {
            onClose();
            navigate("/notificacoes");
          }}
        >
          Ver todas as notificações
        </Button>
      </div>
    </div>
  );
};

export default NotificationsDropdown;

