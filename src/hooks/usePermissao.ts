import { useAuth } from "@/pages/Auth/AuthContext";

type TipoPermissao = "canview" | "canedit" | "caninsert" | "candelete" | "cantodos";

export function usePermissao() {
  const { usuario } = useAuth();

  const temPermissao = (
    permissaoid: string,
    tipo: TipoPermissao = "canview"
  ): boolean => {
    if (!usuario?.permissoes) return false;

    return usuario.permissoes.some((p) =>
      p.permissaoid === permissaoid &&
      (p[tipo] || p.cantodos)
    );
  };

  return { temPermissao };
}
