import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { MenuPermission } from "@/pages/Configuracoes/models/permission.types";

type RawPermissao = {
  permissaoid: string;
  canview: boolean;
  caninsert: boolean;
  canedit: boolean;
  candelete: boolean;
  cantodos: boolean;
  tblmenupermissao: {
    id: string;
    nomemenu: string;
  } | null;
};

export const useListarPermissoes = () => {
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  /**
   * Lista as permissões associadas a um grupo de usuários.
   * @param grupoUsuarioId ID do grupo de usuários
   * @returns Array de permissões (MenuPermission[])
   */
  const listarPermissoes = async (
    grupoUsuarioId: string
  ): Promise<MenuPermission[]> => {
    if (!grupoUsuarioId) {
      setErro("ID do grupo de usuário é obrigatório.");
      return [];
    }

    setLoading(true);
    setErro(null);

    try {
      console.log('Grupo: ',grupoUsuarioId);
      const { data, error } = await supabase
        .from("tblpermissoes")
        .select(`
          permissaoid,
          canview,
          caninsert,
          canedit,
          candelete,
          cantodos,
          tblmenupermissao (
            id,
            nomemenu
          )
        `)
        .eq("grupousuarioid", grupoUsuarioId);

      if (error) throw error;

      return (data as RawPermissao[]).map((item) => ({
        id: item.permissaoid,
        nome: item.tblmenupermissao?.nomemenu || "",
        canView: item.canview,
        canInsert: item.caninsert,
        canEdit: item.canedit,
        canDelete: item.candelete,
        canTodos: item.cantodos,
      }));
    } catch (err: any) {
      console.error("Erro ao listar permissões:", err.message || err);
      setErro(err.message || "Erro inesperado ao buscar permissões.");
      return [];
    } finally {
      setLoading(false);
    }
  };

  const resetErro = () => setErro(null);

  return { listarPermissoes, loading, erro, resetErro };
};

