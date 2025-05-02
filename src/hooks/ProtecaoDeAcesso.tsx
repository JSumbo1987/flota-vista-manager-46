
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { estaAutenticado, obterUsuario } from "@/components/utils/usuarioStorage";

interface Props {
  children: React.ReactNode;
  userid?: string;
}

// Function to verify token (since it was missing)
const verificarToken = (token: string): { valido: boolean, usuario: any } => {
  const autenticado = estaAutenticado();
  const usuario = obterUsuario();
  
  return {
    valido: autenticado && !!token,
    usuario: usuario
  };
};

const ProtecaoDeAcesso: React.FC<Props> = ({ children, userid }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const verificarStatus = async () => {
      // Verificar se existe um token salvo
      const token = localStorage.getItem("token");
      
      if (!token) {
        // Se não houver token, redireciona para login
        navigate("/login");
        return;
      }
      
      // Verifica se o token é válido
      const { valido, usuario } = verificarToken(token);
      
      if (!valido || !usuario) {
        // Token inválido ou expirado, redireciona para login
        localStorage.removeItem("token");
        navigate("/login");
        return;
      }
      
      // Se houver um userid específico para verificação
      if (userid) {
        const { data: usuarioDB, error } = await supabase
          .from("tblusuarios")
          .select("useremailconfirmed, isfastlogin")
          .eq("userid", userid)
          .single();

        if (error || !usuarioDB) {
          // Se usuário não existe, redireciona para login
          navigate("/login");
          return;
        }

        if (!usuarioDB.useremailconfirmed) {
          // Email não confirmado, redireciona para página de confirmação
          navigate("/aguardando-confirmacao");
          return;
        }

        if (usuarioDB.isfastlogin === 0) {
          // Primeiro login, força alteração de senha
          navigate(`/alterar-senha/${userid}`);
          return;
        }
      }
    };

    verificarStatus();
  }, [userid, navigate]);

  return <>{children}</>;
};

export default ProtecaoDeAcesso;
