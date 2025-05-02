
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

export function useNotifications(pollInterval = 60000) { // 1 minuto
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      const { data, error } = await supabase
        .from("tblnotificacoes")
        .select("*")
        .order("created_at", { ascending: false });
  
      if (error) throw error;
      // ✅ Filtra apenas não lidas
      setNotifications((data || []).filter(n => !n.lido));
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);
  

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, pollInterval);
    return () => clearInterval(interval);
  }, [fetchNotifications, pollInterval]);

  return { notifications, loading, error, refetch: fetchNotifications };
}


