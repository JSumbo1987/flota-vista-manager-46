import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabaseClient";
import { useToast } from "@/hooks/use-toast";

const AguardandoConfirmacao = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Pegue o usuário atual do Supabase Auth
  const user = supabase.auth.user();

  const handleReenviarEmail = async () => {
    if (!user?.email) {
      toast({
        title: "Erro",
        description: "Usuário não está logado ou email indisponível.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Aqui você pode chamar sua API para reenviar email de confirmação
      // Exemplo fictício: 
      // await fetch('/api/enviar-email-confirmacao', { method: 'POST', body: JSON.stringify({ to: user.email, ... }) })

      // Ou, se usar Supabase Auth nativo, pode tentar reenvio:
      const { error } = await supabase.auth.api.sendVerificationEmail(user.email);
      if (error) throw error;

      toast({
        title: "Email reenviado",
        description: `Um novo email de confirmação foi enviado para ${user.email}`,
      });
    } catch (error) {
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-6">
      <h1 className="text-3xl font-bold">Confirmação de Email Pendente</h1>
      <p className="max-w-md text-muted-foreground">
        Para continuar, por favor confirme seu endereço de email.
        Verifique sua caixa de entrada e também a pasta de spam.
      </p>
      <p className="max-w-md text-muted-foreground">
        Caso não tenha recebido o email, clique no botão abaixo para reenviar.
      </p>

      <Button onClick={handleReenviarEmail} disabled={loading}>
        {loading ? "Enviando..." : "Reenviar Email de Confirmação"}
      </Button>

      <Button variant="ghost" onClick={() => navigate("/login")}>
        Voltar para Login
      </Button>
    </div>
  );
};

export default AguardandoConfirmacao;
