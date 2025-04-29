import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/lib/supabaseClient";

interface Notification {
  id: string;
  titulo: string;
  descricao: string;
  tipo: "warning" | "error" | "info" | "success";
  lido: boolean;
  rota: string;
  created_at: string;
}

export function useNotifications(pollInterval = 5 * 60 * 1000) { // padrão: 5 minutos
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Chamar a edge function que verifica e cria notificações
      const response = await fetch("https://kbiwjoecupoulyasrnao.supabase.co/functions/v1/database-access", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`, 
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Erro na edge function: ${response.statusText}`);
      }

      // 2. Buscar as notificações criadas na tabela
      const { data, error } = await supabase
        .from<Notification>("tblnotificacoes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err) || "Erro desconhecido");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(() => {
      fetchNotifications();
    }, pollInterval);

    return () => clearInterval(interval);
  }, [fetchNotifications, pollInterval]);

  return { notifications, loading, error, refetch: fetchNotifications };
}

