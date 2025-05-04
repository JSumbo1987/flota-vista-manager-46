import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient"; // ajuste conforme seu caminho real

interface Permissao {
  id: string;
  permissaoid: string;
  grupousuarioid: number;
  caninsert: boolean;
  canedit: boolean;
  candelete: boolean;
  canview: boolean;
  cantodos: boolean;
}

interface Usuario {
  userid: number;
  useremail: string;
  usernome: string;
  funcionarioId?: number;
  grupoid?: number;
  permissoes: Permissao[];
}


type AuthContextType = {
  usuario: Usuario | null;
  login: (usuario: Usuario) => void;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Duração do token em milissegundos (8 horas)
const TOKEN_DURATION = 8 * 60 * 60 * 1000;

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [usuario, setUsuario] = useState<Usuario | null>(null);

  // Verifica a validade do token com base no timestamp salvo
  const checkSessionValidity = () => {
    const storedUser = localStorage.getItem("usuario");
    const storedTimestamp = localStorage.getItem("login_timestamp");

    if (storedUser && storedTimestamp) {
      const timestamp = parseInt(storedTimestamp, 10);
      const now = Date.now();

      if (now - timestamp < TOKEN_DURATION) {
        setUsuario(JSON.parse(storedUser));
      } else {
        logout(); // token expirado
      }
    } else {
      logout(); // ausência de dados
    }
  };

  // Verificação inicial e a cada X minutos
  useEffect(() => {
    checkSessionValidity();

    const interval = setInterval(() => {
      checkSessionValidity();
    }, 60 * 1000); // Verifica a cada 1 minuto

    return () => clearInterval(interval);
  }, []);

  const login = async (usuario: Usuario) => {
    let permissoes: any[] = [];

    if (usuario.grupoid) {
      const { data, error } = await supabase
        .from("tblpermissoes")
        .select("*")
        .eq("grupousuarioid", usuario.grupoid);

      if (error) {
        console.error("Erro ao buscar permissões:", error.message);
      } else {
        permissoes = data || [];
      }
    }

    const usuarioComPermissoes = {
      ...usuario,
      permissoes,
    };

    localStorage.setItem("usuario", JSON.stringify(usuarioComPermissoes));
    localStorage.setItem("login_timestamp", Date.now().toString());
    setUsuario(usuarioComPermissoes);
    navigate("/");
  };

  const logout = () => {
    localStorage.removeItem("usuario");
    localStorage.removeItem("login_timestamp");
    setUsuario(null);
    navigate("/login");
  };

  const value = {
    usuario,
    login,
    logout,
    isAuthenticated: !!usuario,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth deve ser usado dentro do AuthProvider");
  }
  return context;
};


