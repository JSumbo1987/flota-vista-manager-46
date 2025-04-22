
import { useNavigate } from "react-router-dom";
import { X, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

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

  const notifications = [
    {
      id: "1",
      title: "Licença a vencer",
      description: "Viatura ABC-1234 com licença vencendo em 5 dias",
      time: "Há 15 min",
      read: false,
      type: "warning",
      route: "/licenca-transporte/1",
    },
    {
      id: "2",
      title: "Checklist pendente",
      description: "Você tem 3 checklists pendentes para hoje",
      time: "Há 1 hora",
      read: false,
      type: "warning",
      route: "/checklist",
    },
    {
      id: "3",
      title: "Manutenção agendada",
      description: "Manutenção programada para viatura XYZ-5678 amanhã",
      time: "Há 3 horas",
      read: true,
      type: "info",
      route: "/agendamentos/3",
    },
    {
      id: "4",
      title: "Novo serviço registrado",
      description: "Serviço #1234 foi registrado com sucesso",
      time: "Há 5 horas",
      read: true,
      type: "success",
      route: "/servicos/4",
    },
    {
      id: "5",
      title: "Certificado expirado",
      description: "Certificado da viatura DEF-5678 expirou hoje",
      time: "Há 8 horas",
      read: true,
      type: "error",
      route: "/certificados/5",
    },
  ];

  const handleNotificationClick = (route: string) => {
    onClose();
    navigate(route);
  };

  return (
    <div className="absolute right-0 mt-2 w-80 bg-card rounded-md shadow-lg z-50 border">
      <div className="p-3 flex items-center justify-between border-b">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          <h3 className="font-medium">Notificações</h3>
          <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full">
            {notifications.filter((n) => !n.read).length}
          </span>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="h-[400px]">
        <div className="p-0">
          {notifications.map((notification) => (
            <NotificationItem
              key={notification.id}
              id={notification.id}
              title={notification.title}
              description={notification.description}
              time={notification.time}
              read={notification.read}
              type={notification.type as any}
              onClick={() => handleNotificationClick(notification.route)}
            />
          ))}
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
