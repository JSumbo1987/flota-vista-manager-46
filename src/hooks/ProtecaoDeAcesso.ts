import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";

interface Props {
  children: React.ReactNode;
  userid: string;
}

const ProtecaoDeAcesso: React.FC<Props> = ({ children, userid }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verificarStatus = async () => {
      if (!userid) return;

      const { data: usuario, error } = await supabase
        .from("tblusuarios")
        .select("useremailconfirmed, isfastlogin")
        .eq("userid", userid)
        .single();

      if (error || !usuario) {
        // Se usuário não existe, redireciona para login
        navigate("/login");
        return;
      }

      if (!usuario.useremailconfirmed) {
        // Email não confirmado, redireciona para página de confirmação
        navigate("/aguardando-confirmacao");
        return;
      }

      if (usuario.isfastlogin === 0) {
        // Primeiro login, força alteração de senha
        navigate(`/alterar-senha/${userid}`);
        return;
      }
    };

    verificarStatus();
  }, [userid, navigate]);

  return <>{children}</>;
};

export default ProtecaoDeAcesso;
