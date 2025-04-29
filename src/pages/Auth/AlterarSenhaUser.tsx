import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";

const AlterarSenhaUser = () => {
  const { userid } = useParams();
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleAlterarSenha = async () => {
    if (!novaSenha || !confirmaSenha) {
      toast({ title: "Preencha os campos", variant: "destructive" });
      return;
    }
    if (novaSenha !== confirmaSenha) {
      toast({ title: "As senhas não coincidem", variant: "destructive" });
      return;
    }

    setLoading(true);

    const { error } = await supabase
      .from("tblusuarios")
      .update({ userpassword: novaSenha, isfastlogin: 1 })
      .eq("userid", userid);

    setLoading(false);

    if (error) {
      toast({ title: "Erro ao alterar senha", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Senha alterada com sucesso!" });
      navigate("/login");
    }
  };

  return (
    <div className="max-w-md mx-auto p-4">
      <h2 className="text-xl font-bold mb-4">Alterar Senha</h2>
      <Input
        type="password"
        placeholder="Nova senha"
        value={novaSenha}
        onChange={(e) => setNovaSenha(e.target.value)}
        className="mb-2"
      />
      <Input
        type="password"
        placeholder="Confirme a nova senha"
        value={confirmaSenha}
        onChange={(e) => setConfirmaSenha(e.target.value)}
        className="mb-4"
      />
      <Button onClick={handleAlterarSenha} disabled={loading}>
        {loading ? "Alterando..." : "Alterar Senha"}
      </Button>
    </div>
  );
};

export default AlterarSenhaUser;
