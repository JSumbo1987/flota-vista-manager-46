import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const ConfirmarEmailUser = () => {
  const [searchParams] = useSearchParams();
  const email = searchParams.get("email") || "";
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast({
        title: "Email inválido",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    const confirmarEmail = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("tblusuarios")
        .update({ useremailconfirmed: true })
        .eq("useremail", email);

      setLoading(false);

      if (error) {
        toast({
          title: "Erro ao confirmar email",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Email confirmado",
          description: "Seu email foi confirmado com sucesso!",
        });
        navigate("/login"); // Redireciona para login
      }
    };

    confirmarEmail();
  }, [email, navigate, toast]);

  return (
    <div className="p-4 max-w-md mx-auto text-center">
      {loading ? <p>Confirmando seu email...</p> : <p>Processando confirmação...</p>}
    </div>
  );
};

export default ConfirmarEmailUser;
