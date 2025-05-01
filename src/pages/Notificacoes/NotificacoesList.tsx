
import { useState, useEffect } from "react";
import { Bell, Check, Trash, Filter, RefreshCcw } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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

  const getBadgeVariant = (tipo: Notificacao['tipo']) => {
    switch (tipo) {
      case 'info': return 'secondary';
      case 'warning': return 'warning';
      case 'error': return 'destructive';
      case 'success': return 'success';
      default: return 'secondary';
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
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center">
            <Bell className="mr-2 h-6 w-6" />
            Notificações
          </h2>
          <p className="text-muted-foreground">
            Gerencie todas as suas notificações do sistema
          </p>
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
          
          <Button variant="outline" onClick={carregarNotificacoes}>
            <RefreshCcw className="h-4 w-4" />
          </Button>

          <Button variant="secondary" onClick={marcarTodasComoLidas}>
            <Check className="h-4 w-4 mr-2" />
            Marcar todas como lidas
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Suas notificações</CardTitle>
          <CardDescription>
            {notificacoes.filter(n => !n.lida).length} notificações não lidas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : notificacoes.length === 0 ? (
            <div className="text-center py-10">
              <Bell className="h-12 w-12 mx-auto text-muted-foreground opacity-50" />
              <p className="mt-2 text-lg text-muted-foreground">Nenhuma notificação encontrada</p>
              <p className="text-sm text-muted-foreground">
                As notificações do sistema aparecerão aqui quando disponíveis
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notificacoes.map((notif) => (
                <div 
                  key={notif.notificacaoid}
                  className={`p-4 rounded-md border ${notif.lida ? 'bg-muted/30' : 'bg-card'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div 
                        className={`p-2 rounded-full bg-${getBadgeVariant(notif.tipo)}/20 text-${getBadgeVariant(notif.tipo)}`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{notif.titulo}</h4>
                          {!notif.lida && (
                            <Badge variant="default" className="text-xs">Nova</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{notif.mensagem}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          {formatarData(notif.datahora || notif.criado_em)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-1">
                      {!notif.lida && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => marcarComoLida(notif.notificacaoid)}
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => excluirNotificacao(notif.notificacaoid)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {notif.actionurl && (
                    <div className="mt-3 flex justify-end">
                      <Button variant="link" asChild className="p-0 h-auto">
                        <a href={notif.actionurl} target="_blank" rel="noopener noreferrer">
                          Ver detalhes
                        </a>
                      </Button>
                    </div>
                  )}
                </div>
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
    </div>
  );
};

export default NotificacoesList;
