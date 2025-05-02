
import { Bell, Check, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface NotificationItemProps {
  notification: {
    notificacaoid: string;
    titulo: string;
    mensagem: string;
    tipo: "info" | "warning" | "success" | "error";
    lida: boolean;
    actionurl?: string;
  };
  formattedDate: string;
  onMarkAsRead: () => void;
  onDelete: () => void;
}

const NotificationItem = ({ 
  notification, 
  formattedDate,
  onMarkAsRead, 
  onDelete 
}: NotificationItemProps) => {
  
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

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case 'info': return 'secondary';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      case 'success': return 'success';
      default: return 'secondary';
    }
  };

  return (
    <div 
      className={`p-4 rounded-md border ${notification.lida ? 'bg-muted/30' : 'bg-card'}`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <div 
            className={`p-2 rounded-full ${getTypeStyles(notification.tipo)}`}
          >
            <Bell className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-medium">{notification.titulo}</h4>
              {!notification.lida && (
                <Badge variant="default" className="text-xs">Nova</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{notification.mensagem}</p>
            <p className="text-xs text-muted-foreground mt-2">
              {formattedDate}
            </p>
          </div>
        </div>
        <div className="flex space-x-1">
          {!notification.lida && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onMarkAsRead}
              title="Marcar como lida"
            >
              <Check className="h-4 w-4" />
            </Button>
          )}
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onDelete}
            title="Excluir notificação"
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </div>
      {notification.actionurl && (
        <div className="mt-3 flex justify-end">
          <Button variant="link" asChild className="p-0 h-auto">
            <a href={notification.actionurl} target="_blank" rel="noopener noreferrer">
              Ver detalhes
            </a>
          </Button>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;
