
import { useState, useEffect } from "react";
import { Bell, Check, Trash, Filter, RefreshCcw } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface Notificacao {
  id: string;
  titulo: string;
  mensagem: string;
  datahora: string;
  tipo: "info" | "warning" | "success" | "error";
  lido: boolean;
  usuarioid: string;
  actionurl?: string;
  criado_em: string;
}

const getBadgeVariantClass = (tipo: Notificacao["tipo"]) => {
  switch (tipo) {
    case "success":
      return "text-green-600 bg-green-100";
    case "warning":
      return "text-yellow-600 bg-yellow-100";
    case "error":
      return "text-red-600 bg-red-100";
    case "info":
    default:
      return "text-blue-600 bg-blue-100";
  }
};

const NotificacoesList = () => {
  const { toast } = useToast();
  const { usuario } = useAuth();
  const [notificacoes, setNotificacoes] = useState<Notificacao[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtro, setFiltro] = useState<"todas" | "lidas" | "nao-lidas">("todas");
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;

  useEffect(() => {
    carregarNotificacoes();
  }, [filtro, currentPage]);

  const carregarNotificacoes = async () => {
    setIsLoading(true);
    try {
      // First get count for pagination
      let countQuery = supabase
        .from("tblnotificacoes")
        .select("*", { count: "exact", head: true });

      if (filtro === "lidas") {
        countQuery = countQuery.eq("lido", true);
      } else if (filtro === "nao-lidas") {
        countQuery = countQuery.eq("lido", false);
      }

      const { count, error: countError } = await countQuery;
      
      if (countError) throw countError;
      
      const totalPages = Math.ceil((count || 0) / itemsPerPage);
      setTotalPages(totalPages > 0 ? totalPages : 1);
      
      // Then get paginated data
      let query = supabase
        .from("tblnotificacoes")
        .select("*")
        .order("created_at", { ascending: false })
        .range((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage - 1);

      if (filtro === "lidas") {
        query = query.eq("lido", true);
      } else if (filtro === "nao-lidas") {
        query = query.eq("lido", false);
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
        .update({ lido: true })
        .eq("id", id);

      if (error) throw error;

      setNotificacoes(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, lido: true } : notif
        )
      );

      toast({ title: "Notificação marcada como lida" });
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
        .eq("id", id);

      if (error) throw error;

      setNotificacoes(prev =>
        prev.filter(notif => notif.id !== id)
      );

      // If we delete last item on page, go back a page (unless we're on page 1)
      if (notificacoes.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      } else {
        // Refresh to update counts
        carregarNotificacoes();
      }

      toast({ title: "Notificação excluída com sucesso" });
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
      const notificacoesNaoLidas = notificacoes.filter(n => !n.lido).map(n => n.id);

      if (notificacoesNaoLidas.length === 0) {
        toast({
          title: "Informação",
          description: "Não há notificações não lidas",
        });
        return;
      }

      const { error } = await supabase
        .from("tblnotificacoes")
        .update({ lido: true })
        .in("id", notificacoesNaoLidas);

      if (error) throw error;

      setNotificacoes(prev =>
        prev.map(notif => ({ ...notif, lido: true }))
      );

      toast({ title: "Todas as notificações foram marcadas como lidas" });
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

  // Generate pagination
  const renderPagination = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if we have less than maxVisiblePages
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let startPage = Math.max(2, currentPage - 1);
      let endPage = Math.min(totalPages - 1, currentPage + 1);
      
      // If we're at the beginning, show more pages after
      if (currentPage <= 2) {
        endPage = Math.min(totalPages - 1, 4);
      }
      
      // If we're at the end, show more pages before
      if (currentPage >= totalPages - 1) {
        startPage = Math.max(2, totalPages - 3);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push("ellipsis1");
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push("ellipsis2");
      }
      
      // Always show last page
      pages.push(totalPages);
    }

    return (
      <Pagination>
        <PaginationContent>
          {currentPage > 1 && (
            <PaginationItem>
              <PaginationPrevious 
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} 
              />
            </PaginationItem>
          )}
          
          {pages.map((page, index) => (
            page === "ellipsis1" || page === "ellipsis2" ? (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            ) : (
              <PaginationItem key={index}>
                <PaginationLink 
                  isActive={page === currentPage}
                  onClick={() => typeof page === 'number' && setCurrentPage(page)}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            )
          ))}
          
          {currentPage < totalPages && (
            <PaginationItem>
              <PaginationNext 
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))} 
              />
            </PaginationItem>
          )}
        </PaginationContent>
      </Pagination>
    );
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Suas notificações</CardTitle>
          <CardDescription>
            {notificacoes.filter(n => !n.lido).length} notificações não lidas
          </CardDescription>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={filtro} onValueChange={(value) => {
            setFiltro(value as any);
            setCurrentPage(1); // Reset to page 1 when filter changes
          }}>
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
          <ScrollArea className="max-h-[500px] pr-4">
            <div className="space-y-4">
              {notificacoes.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-md border ${notif.lido ? 'bg-muted/30' : 'bg-card'}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div
                        className={`p-2 rounded-full ${getBadgeVariantClass(notif.tipo)}`}
                      >
                        <Bell className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium">{notif.titulo}</h4>
                          {!notif.lido && (
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
                      {!notif.lido && (
                        <Button variant="ghost" size="icon" onClick={() => marcarComoLida(notif.id)}>
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => excluirNotificacao(notif.id)}>
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
          </ScrollArea>
        )}
      </CardContent>
      <CardFooter className="border-t flex flex-col sm:flex-row justify-between items-center pt-4 gap-4">
        <p className="text-sm text-muted-foreground">
          Total de notificações: {notificacoes.length}
        </p>
        {totalPages > 1 && renderPagination()}
      </CardFooter>
    </Card>
  );
};

export default NotificacoesList;
