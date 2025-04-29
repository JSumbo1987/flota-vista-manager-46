import { useEffect, useState, ChangeEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { gerarHashSenha } from "@/hooks/GerarHashSenha";

interface FuncionarioParcial {
  funcionarionome: string;
  funcionarioemail: string;
  funcaotipoid: string | null;
  categoriaid: string | null;
}

interface GrupoUsuario {
  grupoid: number;
  gruponame: string;
}

interface TipoUsuario {
  tipoid: number;
  descricaotipo: string;
}

const CriarContaAcesso = () => {
  const { funcionarioid } = useParams<{ funcionarioid: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [funcionario, setFuncionario] = useState<FuncionarioParcial | null>(null);
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [grupoUsuarios, setGrupoUsuarios] = useState<GrupoUsuario[]>([]);
  const [tipoUsuarios, setTipoUsuarios] = useState<TipoUsuario[]>([]);
  const [grupoSelecionado, setGrupoSelecionado] = useState<number | null>(null);
  const [tipoSelecionado, setTipoSelecionado] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const { data: funcionarioData, error: funcionarioError } = await supabase
        .from("tblfuncionarios")
        .select("funcionarioid, funcionarionome, funcionarioemail, funcaotipoid, categoriaid")
        .eq("funcionarioid", funcionarioid)
        .single();

      if (funcionarioError) {
        toast({
          title: "Erro ao buscar funcionário",
          description: funcionarioError.message,
          variant: "destructive",
        });
      } else {
        setFuncionario(funcionarioData);
      }

      const { data: gruposData } = await supabase
        .from("tblgrupousuarios")
        .select("grupoid, gruponame");
      setGrupoUsuarios(gruposData || []);

      const { data: tiposData } = await supabase
        .from("tbltipousuarios")
        .select("tipoid, descricaotipo");
      setTipoUsuarios(tiposData || []);
    }

    fetchData();
  }, [funcionarioid, toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!funcionario) return;

    if (!senha || !confirmarSenha) {
      toast({
        title: "Senha requerida",
        description: "Por favor, preencha a senha e a confirmação.",
        variant: "destructive",
      });
      return;
    }

    if (senha !== confirmarSenha) {
      toast({
        title: "Senhas não conferem",
        description: "A senha e a confirmação devem ser iguais.",
        variant: "destructive",
      });
      return;
    }

    if (!grupoSelecionado || !tipoSelecionado) {
      toast({
        title: "Selecione grupo e tipo",
        description: "Por favor, escolha o grupo e o tipo de usuário.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const senhaHash = await gerarHashSenha(senha);

      const { error } = await supabase.from("tblusuarios").insert({
        usernome: funcionario.funcionarionome,
        useremail: funcionario.funcionarioemail,
        userpassword: senhaHash,
        tipousuarioid: tipoSelecionado,
        grupousuarioid: grupoSelecionado,
        estado: "activo",
        useremailconfirmed: false,
        isfastlogin: 0,
      });

      if (error) throw error;

      toast({
        title: "Conta criada",
        description: "Conta de acesso criada com sucesso.",
      });

      navigate("/funcionarios");
    } catch (error: any) {
      toast({
        title: "Erro ao criar conta",
        description: error.message || "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!funcionario) {
    return <p>Carregando dados do funcionário...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center">
        <Button variant="ghost" size="icon" onClick={() => navigate("/funcionarios")} className="mr-2">
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-3xl font-bold">Criar Conta de Acesso</h2>
          <p className="text-muted-foreground">Preencha os dados abaixo para criar uma conta</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Dados da Conta</CardTitle>
            <CardDescription>Informações do Funcionário e criação de senha</CardDescription>
          </CardHeader>

          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input value={funcionario.funcionarionome} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={funcionario.funcionarioemail} disabled />
            </div>
            <div>
              <Label>Função</Label>
              <Input value={funcionario.funcaotipoid || "-"} disabled />
            </div>
            <div>
              <Label>Categoria</Label>
              <Input value={funcionario.categoriaid || "-"} disabled />
            </div>
            <div>
              <Label>Senha*</Label>
              <Input
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Digite a senha inicial"
                required
              />
            </div>
            <div>
              <Label>Confirmar Senha*</Label>
              <Input
                type="password"
                value={confirmarSenha}
                onChange={(e) => setConfirmarSenha(e.target.value)}
                placeholder="Confirme a senha"
                required
              />
            </div>
            <div>
              <Label>Grupo de Usuário*</Label>
              <select
                className="w-full p-2 border rounded"
                value={grupoSelecionado ?? ""}
                onChange={(e) => setGrupoSelecionado(Number(e.target.value))}
                required
              >
                <option value="">Selecione o grupo</option>
                {grupoUsuarios.map((g) => (
                  <option key={g.grupoid} value={g.grupoid}>
                    {g.gruponame}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Tipo de Usuário*</Label>
              <select
                className="w-full p-2 border rounded"
                value={tipoSelecionado ?? ""}
                onChange={(e) => setTipoSelecionado(Number(e.target.value))}
                required
              >
                <option value="">Selecione o tipo</option>
                {tipoUsuarios.map((t) => (
                  <option key={t.tipoid} value={t.tipoid}>
                    {t.descricaotipo}
                  </option>
                ))}
              </select>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => navigate("/funcionarios")}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Criando..." : "Criar Conta"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default CriarContaAcesso;

