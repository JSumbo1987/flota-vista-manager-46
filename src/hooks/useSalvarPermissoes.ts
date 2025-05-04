import { supabase } from "@/lib/supabaseClient";
import { MenuPermission } from "@/pages/Configuracoes/models/permission.types";

/**
 * Hook para salvar permissões de menus no Supabase.
 */
export const useSalvarPermissoes = () => {
  /**
   * Salva as permissões no banco de dados.
   * @param grupoUsuarioId ID do grupo de usuários
   * @param permissoes Lista de permissões para salvar
   */
  const salvarPermissoes = async (
    grupoUsuarioId: string,
    permissoes: MenuPermission[]
  ) => {
    // 1. Buscar permissões já existentes para o grupo
    const { data: permissoesExistentes, error: fetchError } = await supabase
      .from("tblpermissoes")
      .select("id, permissaoid, canview, caninsert, canedit, candelete, cantodos")
      .eq("grupousuarioid", grupoUsuarioId);

    if (fetchError) {
      console.error("Erro ao buscar permissões existentes:", fetchError.message);
      throw new Error("Erro ao buscar permissões existentes");
    }

    const mapExistentes = new Map(
      permissoesExistentes?.map((perm) => [perm.permissaoid, perm])
    );

    const dadosParaInserir = [];
    const dadosParaAtualizar = [];

    for (const menu of permissoes) {
      const existente = mapExistentes.get(menu.id);

      const novoRegistro = {
        grupousuarioid: grupoUsuarioId,
        permissaoid: menu.id,
        canview: menu.canView,
        caninsert: menu.canInsert,
        canedit: menu.canEdit,
        candelete: menu.canDelete,
        cantodos: menu.canTodos,
      };

      if (!existente) {
        // Permissão nova → inserir
        dadosParaInserir.push(novoRegistro);
      } else {
        // Verificar se há diferenças → atualizar
        const mudou =
          existente.canview !== menu.canView ||
          existente.caninsert !== menu.canInsert ||
          existente.canedit !== menu.canEdit ||
          existente.candelete !== menu.canDelete ||
          existente.cantodos !== menu.canTodos;

        if (mudou) {
          dadosParaAtualizar.push({
            ...novoRegistro,
            id: existente.id, // necessário para atualizar pelo ID
          });
        }
      }
    }

    // 2. Inserir novas permissões
    if (dadosParaInserir.length > 0) {
      const { error: insertError } = await supabase
        .from("tblpermissoes")
        .insert(dadosParaInserir);

      if (insertError) {
        console.error("Erro ao inserir permissões:", insertError.message);
        throw new Error("Erro ao inserir permissões");
      }
    }

    // 3. Atualizar permissões existentes que mudaram
    for (const atualizacao of dadosParaAtualizar) {
      const { id, ...campos } = atualizacao;
      const { error: updateError } = await supabase
        .from("tblpermissoes")
        .update(campos)
        .eq("id", id);

      if (updateError) {
        console.error(`Erro ao atualizar permissão ID ${id}:`, updateError.message);
        throw new Error("Erro ao atualizar permissões");
      }
    }
  };

  return { salvarPermissoes };
};

