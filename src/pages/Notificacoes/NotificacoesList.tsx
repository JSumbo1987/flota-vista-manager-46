
import { useState, useEffect } from "react";
import { Bell, Check, Trash, Filter, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { useAuth } from "@/pages/Auth/AuthContext";
import NotificationItem from "@/components/notifications/NotificationItem";
import LoadingState from "@/components/ui/loading-state";
import EmptyState from "@/components/ui/empty-state";

interface Notificacao {
  notificacaoid: string;
  titulo: string;
  mensagem: string;
  datahora: string;
  tipo: "info" | "warning" | "success" | "error";
  lida: boolean;
  usuarioid: string;
  actionurl?: string;
  criado_em: string;
}

const NotificacoesList = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "lidas" | "nao-lidas">("todas");

  useEffect(() => {
    carregarNotificacoes();
  }, [filtro]);

  const carregarNotificacoes = async () => {
    setIsLoading(true);
    
    try {
      let query = supabase
        .from("tblnotificacoes")
        .select("*")
        .order("criado_em", { ascending: false });

      if (usuario?.id) {
        query = query.eq("usuarioid", usuario.id);
      }

      if (filtro === "lidas") {
        query = query.eq("lida", true);
      } else if (filtro === "nao-lidas") {
        query = query.eq("lida", false);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      setNotificacoes(data || []);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const marcarComoLida = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tblnotificacoes")
        .update({ lida: true })
        .eq("notificacaoid", id);

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(notif => 
          notif.notificacaoid === id ? { ...notif, lida: true } : notif
        )
      );

      toast({
        title: "Notificação marcada como lida",
      });
    } catch (error) {
      console.error("Erro ao marcar notificação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida",
        variant: "destructive",
      });
    }
  };

  const excluirNotificacao = async (id: string) => {
    try {
      const { error } = await supabase
        .from("tblnotificacoes")
        .delete()
        .eq("notificacaoid", id);

      if (error) throw error;

      setNotificacoes(prev => 
        prev.filter(notif => notif.notificacaoid !== id)
      );

      toast({
        title: "Notificação excluída com sucesso",
      });
    } catch (error) {
      console.error("Erro ao excluir notificação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir a notificação",
        variant: "destructive",
      });
    }
  };

  const marcarTodasComoLidas = async () => {
    try {
      const notificacoesNaoLidas = notificacoes.filter(n => !n.lida).map(n => n.notificacaoid);
      
      if (notificacoesNaoLidas.length === 0) {
        toast({
          title: "Informação",
          description: "Não há notificações não lidas",
        });
        return;
      }

      const { error } = await supabase
        .from("tblnotificacoes")
        .update({ lida: true })
        .in("notificacaoid", notificacoesNaoLidas);

      if (error) throw error;

      setNotificacoes(prev => 
        prev.map(notif => ({ ...notif, lida: true }))
      );

      toast({
        title: "Todas as notificações foram marcadas como lidas",
      });
    } catch (error) {
      console.error("Erro ao marcar todas notificações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas",
        variant: "destructive",
      });
    }
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: pt });
    } catch (e) {
      return data;
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Suas notificações</CardTitle>
          <CardDescription>
            {notificacoes.filter(n => !n.lida).length} notificações não lidas
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filtro} onValueChange={(value) => setFiltro(value as any)}>
            <SelectTrigger className="w-[180px]">
              <div className="flex items-center">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrar" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas</SelectItem>
              <SelectItem value="lidas">Lidas</SelectItem>
              <SelectItem value="nao-lidas">Não lidas</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={carregarNotificacoes} size="icon">
            <RefreshCcw className="h-4 w-4" />
          </Button>

          <Button variant="secondary" onClick={marcarTodasComoLidas}>
            <Check className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Marcar todas como lidas</span>
            <span className="sm:hidden">Marcar todas</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <LoadingState message="Carregando notificações..." />
        ) : notificacoes.length === 0 ? (
          <EmptyState 
            icon={<Bell className="h-12 w-12" />}
            title="Nenhuma notificação encontrada"
            description="As notificações do sistema aparecerão aqui quando disponíveis"
          />
        ) : (
          <div className="space-y-4">
            {notificacoes.map((notif) => (
              <NotificationItem
                key={notif.notificacaoid}
                notification={notif}
                formattedDate={formatarData(notif.datahora || notif.criado_em)}
                onMarkAsRead={() => marcarComoLida(notif.notificacaoid)}
                onDelete={() => excluirNotificacao(notif.notificacaoid)}
              />
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="border-t flex justify-between items-center pt-4">
        <p className="text-sm text-muted-foreground">
          Total de notificações: {notificacoes.length}
        </p>
      </CardFooter>
    </Card>
  );
};

export default NotificacoesList;
