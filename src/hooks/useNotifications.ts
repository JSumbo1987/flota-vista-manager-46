
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

export interface Notification {
  id: string;
  notificacaoid?: string;
  titulo: string;
  descricao: string;
  mensagem?: string;
  tipo: "warning" | "error" | "info" | "success";
  lido: boolean;
  rota: string;
  actionurl?: string;
  created_at: string;
  datahora?: string;
}

export function useNotifications(pollInterval = 60000) { // 1 minuto
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("tblnotificacoes")
        .select("*")
        .eq("lido", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const formattedData = (data || []).map(n => ({
        id: n.id || n.notificacaoid,
        notificacaoid: n.notificacaoid || n.id,
        titulo: n.titulo || "Sem título",
        descricao: n.mensagem || "",
        mensagem: n.mensagem || "",
        tipo: (n.tipo as "warning" | "error" | "info" | "success") || "info",
        lido: n.lido || false,
        rota: n.actionurl || "/",
        actionurl: n.actionurl || "/",
        created_at: n.created_at || n.datahora || new Date().toISOString(),
        datahora: n.datahora || n.created_at
      }));

      setNotifications(formattedData);
      setUnreadCount(formattedData.length);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setNotifications([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      if (!notificationId) return false;

      // Try first with notificacaoid
      let { error } = await supabase
        .from("tblnotificacoes")
        .update({ lido: true })
        .eq("notificacaoid", notificationId);

      // If that fails, try with id
      if (error) {
        const { error: error2 } = await supabase
          .from("tblnotificacoes")
          .update({ lido: true })
          .eq("id", notificationId);
        
        if (error2) throw error2;
      }

      // Atualiza a lista localmente
      setNotifications(prev => prev.filter(n => n.id !== notificationId && n.notificacaoid !== notificationId));
      setUnreadCount(prev => prev - 1);

      return true;
    } catch (err) {
      console.error("Erro ao marcar notificação como lida:", err);
      return false;
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const subscription = supabase
      .channel('notifications-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tblnotificacoes'
      }, () => {
        fetchNotifications();
      })
      .subscribe();

    const interval = setInterval(fetchNotifications, pollInterval);

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, [fetchNotifications, pollInterval]);

  return {
    notifications,
    loading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    unreadCount
  };
}
