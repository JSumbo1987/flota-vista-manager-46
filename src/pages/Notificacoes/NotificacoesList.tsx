
import { useState, useEffect } from "react";
import { Bell, Check, RefreshCw, Filter } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { useNavigate } from "react-router-dom";

interface Notification {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "warning" | "error" | "info" | "success";
  lido: boolean;
  rota: string;
  created_at: string;
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
  notification,
  onMarkAsRead,
  onClick,
}: {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  onClick: () => void;
}) => {
  const date = new Date(notification.created_at);
  const formattedDate = date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const formattedTime = date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`p-4 mb-3 border-l-4 rounded-r-lg hover:bg-muted/50 cursor-pointer transition-colors ${
        getTypeStyles(notification.tipo)
      } ${!notification.lido ? "bg-muted/20" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-start">
        <h4 className="text-sm font-medium">{notification.titulo}</h4>
        <div className="flex items-center">
          {!notification.lido && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
            >
              <Check className="h-3 w-3" />
            </Button>
          )}
          <span className="text-xs text-muted-foreground ml-2">
            {formattedDate} {formattedTime}
          </span>
        </div>
      </div>
      <p className="text-xs mt-1">{notification.descricao}</p>
    </div>
  );
};

const NotificacoesList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>("todas");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // Primeiro, chama a edge function para verificar se há novas notificações
      try {
        const response = await fetch("https://kbiwjoecupoulyasrnao.supabase.co/functions/v1/database-access", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            "Content-Type": "application/json",
          },
        });
        
        if (!response.ok) {
          console.error("Erro ao verificar notificações");
        }
      } catch (error) {
        console.error("Erro ao chamar a edge function:", error);
      }

      // Busca todas as notificações
      const { data, error } = await supabase
        .from("tblnotificacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setNotifications(data || []);
    } catch (error) {
      console.error("Erro ao buscar notificações:", error);
      toast({
        title: "Erro ao carregar notificações",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tblnotificacoes")
        .update({ lido: true })
        .eq("id", id);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id ? { ...notification, lido: true } : notification
        )
      );

      toast({
        title: "Notificação marcada como lida",
        description: "A notificação foi marcada como lida com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from("tblnotificacoes")
        .update({ lido: true })
        .is("lido", false);

      if (error) throw error;

      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, lido: true }))
      );

      toast({
        title: "Notificações marcadas como lidas",
        description: "Todas as notificações foram marcadas como lidas.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível marcar as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.lido) {
      markAsRead(notification.id);
    }
    
    if (notification.rota) {
      navigate(notification.rota);
    }
  };

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "todas") return true;
    if (filter === "nao-lidas") return !notification.lido;
    return notification.tipo === filter;
  });

  const unreadCount = notifications.filter((n) => !n.lido).length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Notificações</h2>
          <p className="text-muted-foreground">
            Gerencie todas as suas notificações do sistema
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchNotifications}
            disabled={loading}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Atualizar
          </Button>
          {unreadCount > 0 && (
            <Button size="sm" onClick={markAllAsRead}>
              <Check className="mr-2 h-4 w-4" />
              Marcar tudo como lido
            </Button>
          )}
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <Bell className="h-5 w-5 mr-2" />
                Centro de Notificações
                {unreadCount > 0 && (
                  <Badge variant="secondary" className="ml-2">
                    {unreadCount} não lida{unreadCount > 1 ? "s" : ""}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>
                Veja todas as suas notificações do sistema
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filtrar
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setFilter("todas")}>
                  Todas
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("nao-lidas")}>
                  Não lidas
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => setFilter("info")}>
                  Informações
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("success")}>
                  Sucessos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("warning")}>
                  Avisos
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter("error")}>
                  Erros
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Todas</TabsTrigger>
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="viaturas">Viaturas</TabsTrigger>
              <TabsTrigger value="funcionarios">Funcionários</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    Carregando notificações...
                  </p>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-muted-foreground">
                    Nenhuma notificação encontrada
                  </p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onClick={() => handleNotificationClick(notification)}
                  />
                ))
              )}
            </TabsContent>
            <TabsContent value="system">
              <p className="text-center py-4 text-muted-foreground">
                Notificações do sistema serão exibidas aqui
              </p>
            </TabsContent>
            <TabsContent value="viaturas">
              <p className="text-center py-4 text-muted-foreground">
                Notificações relacionadas a viaturas serão exibidas aqui
              </p>
            </TabsContent>
            <TabsContent value="funcionarios">
              <p className="text-center py-4 text-muted-foreground">
                Notificações relacionadas a funcionários serão exibidas aqui
              </p>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="border-t pt-4 pb-2">
          <p className="text-xs text-muted-foreground">
            As notificações são geradas automaticamente pelo sistema e podem ser
            relacionadas a manutenções, renovações de documentos, entre outros
            eventos importantes.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NotificacoesList;
