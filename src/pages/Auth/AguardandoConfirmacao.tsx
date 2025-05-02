
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const AguardandoConfirmacao = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    // Try to get user session
    const session = supabase.auth.getSession();
    session.then(({ data }) => {
      if (data && data.session && data.session.user) {
        setEmail(data.session.user.email || "");
      }
    });
  }, []);

  const handleReenviar = async () => {
    if (!email) {
      toast({
        title: "Erro",
        description: "Email não encontrado",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Email de confirmação reenviado com sucesso!",
      });
    } catch (error: any) {
      toast({
        title: "Erro ao reenviar email",
        description: error.message || "Ocorreu um erro ao tentar reenviar o email de confirmação.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <h1 className="text-3xl font-bold">Confirme seu email</h1>
          <p className="mt-2 text-muted-foreground">
            Enviamos um link de confirmação para{" "}
            <span className="font-semibold">{email}</span>
          </p>
        </div>

        <div className="bg-card p-6 rounded-lg border shadow-sm">
          <p className="text-sm">
            Por favor, verifique sua caixa de entrada e clique no link de
            confirmação que enviamos para você. Se não encontrar o email na caixa
            de entrada, verifique também sua pasta de spam.
          </p>

          <div className="mt-8 space-y-4">
            <Button
              className="w-full"
              onClick={handleReenviar}
              disabled={isResending}
            >
              {isResending ? "Reenviando..." : "Reenviar email de confirmação"}
            </Button>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => navigate("/login")}
            >
              Voltar para o login
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AguardandoConfirmacao;
